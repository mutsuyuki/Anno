export default class ShortcutRegister {

  private shortcuts: { key: string, callback: () => void }[] = [];

  public register(shortcuts: { key: string, callback: () => void }[]): void {
    shortcuts.forEach(shortcut => {
      document.addEventListener("keydown", (event) => {
        console.log(event.key, shortcut.key);
        console.log(document.activeElement, document.activeElement instanceof HTMLInputElement);
        if (event.key !== shortcut.key) {
          return;
        }

        const isTextInput = document.activeElement instanceof HTMLInputElement && document.activeElement.type === "text";
        const isTextArea = document.activeElement instanceof HTMLTextAreaElement;
        if (isTextArea || isTextInput) {
          return;
        }
        shortcut.callback();
      });
    });

    this.shortcuts.concat(shortcuts);
  }

  public unregister(): void {
    this.shortcuts.forEach(shortcut => {
      document.removeEventListener("keydown", shortcut.callback);
    });

    this.shortcuts = [];
  }
}
