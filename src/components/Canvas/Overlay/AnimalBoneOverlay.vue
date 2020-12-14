<template>
  <CanvasRenderer :graphics="graphics"/>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import CanvasRenderer from "@/components/Canvas/Renderer/CanvasRenderer.vue";
import {Graphic} from "@/components/Canvas/Renderer/Graphic";
import {MovingPoint, MovingPointUtil, Point, PointUtil} from "@/common/interface/Point";
import {Color} from "@/common/interface/Color";
import DeepCloner from "@/common/utils/DeepCloner";
import {AnimalBoneModel} from "@/common/model/AnimalBoneModel";
import MultiLines from "@/components/Canvas/Renderer/MultiLines";
import MultiCircles from "@/components/Canvas/Renderer/MultiCircles";

@Component({
  components: {
    CanvasRenderer,
  }
})
export default class AnimalBoneOverlay extends Vue {
  @Prop() private animalBoneModels!: { [objectId: string]: AnimalBoneModel };
  @Prop() private selectingObjectId!: string;
  @Prop() private selectingJointName!: string;

  @Prop({default: true}) private useInteraction!: boolean;
  @Prop({default: false}) private isDeleteMode!: boolean;
  @Prop() private dragStartPosition!: MovingPoint;
  @Prop() private draggingPosition!: MovingPoint;
  @Prop() private dragEndPosition!: MovingPoint;
  @Prop() private hoverPosition!: Point;

  @Prop({default: {r: 0, g: 40, b: 150, a: 1}}) private boneColor!: Color;
  @Prop({default: {r: 0, g: 150, b: 40, a: 1}}) private jointColor!: Color;
  @Prop({default: {r: 150, g: 40, b: 0, a: 1}}) private jointRightLegColor!: Color;

  private graphics: Graphic[] = [];
  private interactionWatchers: (() => void)[] = [];

  created() {
    // モデルの状態が変わったら描画
    this.$watch(() => this.animalBoneModels, () => this.draw(), {deep: true});
    this.$watch(() => this.selectingJointName, () => this.draw(), {deep: true});
    this.$watch(() => this.boneColor, () => this.draw(), {deep: true});
    this.$watch(() => this.jointColor, () => this.draw(), {deep: true});
    this.$watch(() => this.jointRightLegColor, () => this.draw(), {deep: true});

    // インタラクションの有効無効を監視
    this.$watch(
        () => this.useInteraction,
        () => {
          if (this.useInteraction) {
            this.watchInteraction();
          } else {
            this.unwatchInteraction();
          }
        },
        {deep: true, immediate: true}
    );
  }

  private watchInteraction() {
    this.interactionWatchers.push(...[
      // ドラッグ座標もらった
      this.$watch(() => this.dragStartPosition, () => this.dragStart(), {deep: true}),
      this.$watch(() => this.draggingPosition, () => this.dragging(), {deep: true}),
      this.$watch(() => this.dragEndPosition, () => this.dragEnd(), {deep: true}),

      // ホバー座標もらった
      this.$watch(() => this.hoverPosition, () => this.hover(), {deep: true})
    ]);
  }

  private unwatchInteraction() {
    this.interactionWatchers.forEach(f => f());
  }

  private draw() {
    const graphics: Graphic[] = [];

    const boneColor = DeepCloner.copy(this.boneColor);
    const jointColor = DeepCloner.copy(this.jointColor);
    const jointRightLegColor = DeepCloner.copy(this.jointRightLegColor);

    for (const objectId in this.animalBoneModels) {
      const bone = this.animalBoneModels[objectId];
      const isSelecting = this.selectingObjectId == objectId;

      // ------ bone  --------------------------------------------------
      boneColor.a *= this.boneColor.a * (isSelecting ? 1 : 0.7);
      const boneLines = new MultiLines(
          [
            {start: bone.mouse, end: bone.head},
            {start: bone.head, end: bone.cervical_spine},
            {start: bone.cervical_spine, end: bone.left_shoulder},
            {start: bone.left_shoulder, end: bone.left_elbow},
            {start: bone.left_elbow, end: bone.left_wrist},
            {start: bone.left_wrist, end: bone.left_finger},
            {start: bone.cervical_spine, end: bone.right_shoulder},
            {start: bone.right_shoulder, end: bone.right_elbow},
            {start: bone.right_elbow, end: bone.right_wrist},
            {start: bone.right_wrist, end: bone.right_finger},
            {start: bone.cervical_spine, end: bone.pelvis},
            {start: bone.pelvis, end: bone.left_waist},
            {start: bone.left_waist, end: bone.left_knee},
            {start: bone.left_knee, end: bone.left_heel},
            {start: bone.left_heel, end: bone.left_toe},
            {start: bone.pelvis, end: bone.right_waist},
            {start: bone.right_waist, end: bone.right_knee},
            {start: bone.right_knee, end: bone.right_heel},
            {start: bone.right_heel, end: bone.right_toe},
          ].filter(v => v.start.x != -9999 && v.end.x != -9999),
          2,  // width
          boneColor
      );
      boneLines.zIndex = 1;
      graphics.push(boneLines);

      // ------ joint --------------------------------------------------
      jointColor.a = this.jointColor.a * (isSelecting ? 1 : 0.4);
      const joints = Object.entries(bone).filter((v) => v[0].indexOf("right") < 0);
      const jointPositions = joints.map(v => v[1]) as Point[];
      const boneJoints = new MultiCircles(jointPositions, 4, jointColor);
      boneJoints.zIndex = 2;
      graphics.push(boneJoints);

      // ------ joint right leg --------------------------------------------------
      jointRightLegColor.a = this.jointRightLegColor.a * (isSelecting ? 1 : 0.4);
      const jointsRightLeg = Object.entries(bone).filter((v) => v[0].indexOf("right") >= 0);
      const jointRightLegPositions = jointsRightLeg.map(v => v[1]) as Point[];
      const boneJointsRight = new MultiCircles(jointRightLegPositions, 4, jointRightLegColor);
      boneJointsRight.zIndex = 3;
      graphics.push(boneJointsRight);
    }
    this.graphics = graphics;
  }

  private dragStart() {
    // 関節を探す

    const clickedJoint = this.searchJoint(this.dragStartPosition);
    const objectId = clickedJoint.objectId;
    const jointName = clickedJoint.jointName;

    if (jointName) {
      if (this.isDeleteMode) {
        this.$emit("delete", objectId, jointName);
      } else {
        this.$emit("movestart", objectId, jointName);
      }
    } else {
      this.$emit("unselect");
    }
  }

  private dragging() {
    if (this.isEnableDrag) {
      const editedJointPosition = MovingPointUtil.toPoint(this.draggingPosition);
      this.$emit("move", this.selectingObjectId, this.selectingJointName, editedJointPosition);
    }
  }

  private dragEnd() {
    if (this.isEnableDrag) {
      this.$emit("moveend", this.selectingObjectId, this.selectingJointName);
    }
  }

  private hover() {
    const clickedJoint = this.searchJoint(this.hoverPosition);
    this.$emit("hover", clickedJoint.objectId, clickedJoint.jointName);
  }

  // --- common ----------------------------------
  get isEnableDrag() {
    const selectingObject = this.animalBoneModels[this.selectingObjectId] as any;
    if (!selectingObject)
      return false;

    const selectingJoint = selectingObject[this.selectingJointName];
    if (!selectingJoint)
      return false;

    return true;
  }

  private searchJoint(position: Point) {
    let nearestDistance = Number.MAX_VALUE;
    let nearestJoint: { objectId: string, jointName: string } = {objectId: "", jointName: ""};

    for (const objectId in this.animalBoneModels) {
      for (const jointName in this.animalBoneModels[objectId]) {
        const bonePosition = (<any>this.animalBoneModels[objectId])[jointName];
        const distance = PointUtil.distance(bonePosition, position);
        if (distance < 0.05 && distance < nearestDistance) {
          nearestDistance = distance;
          nearestJoint = {objectId: objectId, jointName: jointName};
        }
      }
    }
    return nearestJoint;
  }
}

</script>

<style scoped lang="scss"></style>
