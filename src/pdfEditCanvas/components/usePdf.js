/* eslint-disable import/prefer-default-export */
import * as pdf from 'pdfjs-dist';
import * as PdfWorker from 'pdfjs-dist/build/pdf.worker.js';
import { useEffect, useRef, useState } from 'react';

window.pdfjsWorker = PdfWorker;
pdf.GlobalWorkerOptions.workerSrc = PdfWorker;

export const usePDFData = (options) => {
    const previewUrls = useRef([]);
    const urls = useRef([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        urls.current = [];
        setLoading(true);
        (async () => {
            const pdfDocument = await pdf.getDocument(options.src).promise;
            const task = new Array(pdfDocument.numPages).fill(null);
            await Promise.all(task.map(async (_, i) => {
                const page = await pdfDocument.getPage(i + 1);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');

                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                const renderTask = page.render({
                    canvasContext: ctx,
                    viewport,
                });
                await renderTask.promise;
                urls.current[i] = canvas.toDataURL('image/jpeg', 1.0);
                previewUrls.current[i] = canvas.toDataURL('image/jpeg', 1.0);
            }));
            setLoading(false);
        })();
    }, [options.src]);

    return {
        loading,
        urls: urls.current,
        previewUrls: previewUrls.current,
    };
};
