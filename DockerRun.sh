IMAGE_REPOSITORY="anno"
IMAGE_TAG="latest"
IMAGE_FULLNAME="${IMAGE_REPOSITORY}:${IMAGE_TAG}"
CONTAINER_NAME="${IMAGE_REPOSITORY}_${IMAGE_TAG}_$(date "+%Y_%m%d_%H%M%S")"


# select Dockerfile
DOCKERFILE="Dockerfile"
if [ ! -e ./${DOCKERFILE} ]; then
    read -p "Please enter Dockerfile name: " DOCKERFILE_TYPE
    DOCKERFILE="${DOCKERFILE_TYPE}.Dockerfile"
    if [ ! -e ./${DOCKERFILE} ]; then
        exit
    fi
fi


# build
docker build \
--progress=plain \
-f ${DOCKERFILE} \
-t ${IMAGE_FULLNAME} \
--build-arg USERNAME="$(whoami)" \
--build-arg TIMEZONE="Asia/Tokyo" \
.


# create external dataset path
MEDIA_ROOT="/media/$(whoami)"
if [ -e ${MEDIA_ROOT} ]; then
    MEDIA_NAME="$(ls ${MEDIA_ROOT} | head -n 1)"
    DATASET_DIR="${MEDIA_ROOT}/${MEDIA_NAME}/dataset"
else
    DATASET_DIR="/dummy/dummy"
fi


# run container
docker run \
$(for i in $(id -G); do echo -n --group-add="${i} "; done) \
--interactive \
--tty \
--rm \
\
--env="QT_X11_NO_MITSHM=1" \
--env="DISPLAY=${DISPLAY}" \
--env="WAYLAND_DISPLAY=${WAYLAND_DISPLAY}" \
--env="XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR}" \
--env="PULSE_SERVER=${PULSE_SERVER}" \
--env="NVIDIA_DRIVER_CAPABILITIES=all" \
\
--mount="type=bind,src=$(pwd),dst=/home/$(whoami)/share" \
--mount="type=bind,src=/etc/group,dst=/etc/group,readonly" \
--mount="type=bind,src=/etc/passwd,dst=/etc/passwd,readonly" \
--mount="type=bind,src=/etc/shadow,dst=/etc/shadow,readonly" \
--mount="type=bind,src=/etc/sudoers.d,dst=/etc/sudoers.d,readonly" \
--mount="type=bind,src=/tmp/.X11-unix,dst=/tmp/.X11-unix" \
\
--device="/dev/snd:/dev/snd" \
--device="/dev/input:/dev/input" \
--device="/dev/dri:/dev/dri" \
\
--gpus="all" \
--shm-size="2g" \
--ulimit="memlock=-1" \
--ulimit="stack=67108864" \
\
$( if [ -n "$(which wslpath)"     ]; then echo --mount="type=bind,src=/mnt/wslg,dst=/mnt/wslg" ; fi ) \
$( if [ -n "$(which wslpath)"     ]; then echo --mount="type=bind,src=/usr/lib/wsl,dst=/usr/lib/wsl" ; fi ) \
$( if [ -n "$(which wslpath)"     ]; then echo --device="/dev/dxg:/dev/dxg" ; fi ) \
\
$( if [ -e "${HOME}/.Xauthority"  ]; then echo --mount="type=bind,src=${HOME}/.Xauthority,dst=/home/$(whoami)/.Xauthority"; fi ) \
\
$( if [ -e "${DATASET_DIR}"       ]; then echo --mount="type=bind,src=${DATASET_DIR},dst=/home/$(whoami)/share/dataset" ; fi ) \
\
$( if [ -e "/dev/video0"          ]; then echo --device="/dev/video0:/dev/video0" ; fi ) \
$( if [ -e "/dev/video1"          ]; then echo --device="/dev/video1:/dev/video1" ; fi ) \
$( if [ -e "/dev/video2"          ]; then echo --device="/dev/video2:/dev/video2" ; fi ) \
$( if [ -e "/dev/video3"          ]; then echo --device="/dev/video3:/dev/video3" ; fi ) \
$( if [ -e "/dev/video4"          ]; then echo --device="/dev/video4:/dev/video4" ; fi ) \
$( if [ -e "/dev/video5"          ]; then echo --device="/dev/video5:/dev/video5" ; fi ) \
\
$( if [ -z "$(which wslpath)"     ]; then echo --net="host"; fi ) \
$( if [ 1 -eq 1                   ]; then echo --publish="8000:8000"; fi ) \
$( if [ 1 -eq 1                   ]; then echo --publish="8000:8000/udp"; fi ) \
\
--name=${CONTAINER_NAME} \
${IMAGE_FULLNAME} \
\
sh -c "
echo ------- run --------- ;
echo Logged in at $(pwd)
bash
"
