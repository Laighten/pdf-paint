import React from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from 'antd';

function SavePdf(props) {
    const {
        urls, canvasList, setUploading
    } = props;

    // 加载图片
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // 将两张图片合并
    const mergeImage = async () => {
        if (!urls.length) return;
        const result = [];
        await urls?.map((image1,index) => {
            const image2 = canvasList[index];
            if (image2) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext("2d");
                // const ratio = getPixelRatio(ctx);  // 关键代码
                canvas.width = 550 * 4
                canvas.height = 779 * 4
                // 确保两张图片都加载完成后绘制
                Promise.all([
                    loadImage(image1),
                    loadImage(image2)
                ])
                .then(([loadedImg1, loadedImg2]) => {
                    ctx.drawImage(loadedImg1, 0, 0, canvas.width, canvas.height); // 绘制第一张图片

                    ctx.globalAlpha = 1.0; // 设置合并透明度
                    ctx.drawImage(loadedImg2, 0, 0, canvas.width, canvas.height); // 绘制第二张图片

                    // 获取合并后的图片的数据 URL
                    const mergedImage = canvas.toDataURL('image/jpeg');
                    result[index] = mergedImage;
                });
            } else {
                result[index] = image1;
            }
        });
        return result;
    }

    const saveAsPDF = async () => {
        setUploading(true);
        const pdfDoc = await PDFDocument.create();
        const images = await mergeImage();
        setTimeout(async () => {
            for (const image of images) {
                const imageBytes = await fetch(image).then(res => res.arrayBuffer());
                const img = await pdfDoc.embedJpg(imageBytes);
                const page = pdfDoc.addPage();
                const { width, height } = page.getSize();
                page.drawImage(img, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
            }
            const pdfBytes = await pdfDoc.save();
            // 下载 PDF 文件
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'combined_images.pdf';
            link.click();
            setUploading(false);
        }, 3000)
    };

    return (
        <div>
            <Button 
                type='text'
                onClick={saveAsPDF}>
                    保存
            </Button>
        </div>
    )
}

export default SavePdf;
