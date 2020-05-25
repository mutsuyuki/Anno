export default class FileDownloader {

    // テキストダウンロード
    static downloadTextFile(fileName: string, content: string) {
        let mimeType = 'text/plain';
        let bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // 文字化け対策
        let blob = new Blob([bom, content], {type: mimeType});

        FileDownloader.downloadBlob(fileName, blob);
    }


    // Canavsダウンロード
    static downloadCanvasImage(fileName: string, canvas: HTMLCanvasElement) {
        let imageType = "image/png";
        let base64 = canvas.toDataURL(imageType);
        let tmp = base64.split(',');
        // base64データの文字列をデコード
        let data = atob(tmp[1]);
        let mime = tmp[0].split(':')[1].split(';')[0];
        let buf = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            buf[i] = data.charCodeAt(i);
        }
        let blob = new Blob([buf], {type: mime});
        FileDownloader.downloadBlob(fileName, blob);
    }

    // Blobダウンロード
    static downloadBlob(fileName: string, blob: Blob) {
        if (navigator.msSaveBlob) {
            // for IE
            navigator.msSaveBlob(blob, fileName)
        } else if (URL && URL.createObjectURL) {
            // for Firefox and Chrome and Safari
            let a = document.createElement('a');
            a.download = fileName;
            a.href = URL.createObjectURL(blob);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

}

