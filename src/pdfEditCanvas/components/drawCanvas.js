import React, { useEffect } from 'react';
import { Spin } from "antd";

const DrawingBoard = (props) => {
    const { 
        url,
        canvasRef,
        currentPage,
        canvasList,
        setCanvasList,
        widthE,
        heightE,
        rotationAngle,
        scale,
        OPERATE_ENUM,
        status,
        uploading,
    } = props;
    let lock = false;
    let isEraser = false;
    let x = [];
    let y = [];
    let clickDrag = [];
    let eraserRadius = 10;  // 橡皮擦粗细
    let containerLeft;
    let containerTop;

    const movePoint = (_x, _y) => {   
        /*将鼠标坐标添加到各自对应的数组里*/
        x.push(_x);
        y.push(_y);
        clickDrag.push(_y);
    };

    const drawPoint = (cxt) => {
        for ( var i = 0; i < x.length; i++){   
            cxt.beginPath(); // context.beginPath() , 准备绘制一条路径
            if (clickDrag[i] && i) { //当是拖动而且i!=0时，从上一个点开始画线。
                cxt.moveTo(x[i-1], y[i-1]); // context.moveTo(x, y) , 新开一个路径，并指定路径的起点
            } else {
                cxt.moveTo(x[i]-1, y[i]);
            }
            cxt.lineTo(x[i], y[i]); // context.lineTo(x, y) , 将当前点与指定的点用一条笔直的路径连接起来
            cxt.closePath(); // context.closePath() , 如果当前路径是打开的则关闭它
            cxt.stroke(); // context.stroke() , 绘制当前路径
        }
    }

    const resetEraser = (_x,_y, cxt) => {
        /*使用橡皮擦-提醒*/
        //this.cxt.lineWidth = 30;
        /*source-over 默认,相交部分由后绘制图形的填充(颜色,渐变,纹理)覆盖,全部浏览器通过*/
        cxt.globalCompositeOperation = "destination-out";
        cxt.beginPath();
        cxt.arc(_x, _y, eraserRadius, 0, Math.PI * 2);
        cxt.strokeStyle = "rgba(250,250,250,0)";
        cxt.fill();
        cxt.globalCompositeOperation = "source-over"
    }  

    const onMouseDown = (e) => {
        const canvas = canvasRef.current;
        const cxt = canvas.getContext('2d');
        /* 鼠标按下事件，记录鼠标位置，并绘制，解锁lock，打开mousemove事件 */
        var _x = e.clientX - (e.target.offsetLeft + containerLeft); // 鼠标在画布上的x坐标，以画布左上角为起点
        var _y = e.clientY - (e.target.offsetTop + containerTop); // 鼠标在画布上的y坐标，以画布左上角为点  
        if (isEraser && status === OPERATE_ENUM.ERASER) {
            resetEraser(_x, _y, cxt);
        } else if (lock && status === OPERATE_ENUM.MOSAIC) {
            cxt.strokeStyle = '#000000';
            movePoint(_x, _y); // 记录鼠标位置
            drawPoint(cxt); // 绘制路线
        }
        lock = true;
        isEraser = true;
    };

    const onMouseMove = (e) => {
        const canvas = canvasRef.current;
        const cxt = canvas.getContext('2d');
        var _x = e.clientX - (e.target.offsetLeft + containerLeft); //鼠标在画布上的x坐标，以画布左上角为起点
        var _y = e.clientY - (e.target.offsetTop + containerTop); //鼠标在画布上的y坐标，以画布左上角为起点
        if(isEraser && status === OPERATE_ENUM.ERASER){
            resetEraser(_x, _y, cxt);
        } else if (lock && status === OPERATE_ENUM.MOSAIC) {
            cxt.strokeStyle = '#000000';
            movePoint(_x,_y,true); //记录鼠标位置
            drawPoint(cxt); //绘制路线
        }
    };

    const onMouseUp = (e) => {
        /*重置数据*/
        lock = false;
        isEraser = false;
        x = [];
        y = [];
        clickDrag=[];

        /* 保存当前绘图 */
        const canvas = canvasRef.current;
        const list = [...canvasList];
        list[currentPage] = canvas.toDataURL();
        setCanvasList(list);
    };

    // 监听滚动条，确定画笔的位置
    const handleScroll = (e) => {
        if (e.target) {
            const container = document.getElementById('container').getBoundingClientRect();
            containerLeft = (e.target.offsetLeft - e.target.scrollLeft) + container.left;
            containerTop = (e.target.offsetTop - e.target.scrollTop) + container.top;
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const cxt = canvas.getContext('2d');
            cxt.lineJoin = "round"; //context.lineJoin - 指定两条线段的连接方式
            cxt.lineWidth = 5; //线条的宽度
            const drawPaint = document.getElementById('drawPaint');
            const container = document.getElementById('container').getBoundingClientRect();
            containerLeft = drawPaint.offsetLeft + container.left;
            containerTop = drawPaint.offsetTop + container.top;
            if (drawPaint) {
                drawPaint.addEventListener('scroll', handleScroll);
            }
            return () => {
              if (drawPaint) {
                drawPaint.removeEventListener('scroll', handleScroll);
              }
            };
        }
    }, [status, canvasList]);

    useEffect(() => {
        // 在返回页面时，使用之前保存的数据重新渲染 canvas
        if (canvasList[currentPage]) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = function () {
            ctx.drawImage(img, 0, 0, widthE, heightE);
          };
          img.src = canvasList[currentPage];
        }
    }, [currentPage, canvasList, widthE, heightE]);

    return (
        <Spin
            tip="Loading"
            size="large"
            style={{
                zIndex: uploading ? 1000 : 0
            }}
            spinning={uploading}>
            <div
                id="container"
                style={{
                    border: '1px solid #e1e3e9',
                    height: '86vh',
                    width: '90vw',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#e1e3e9',
                    justifyContent: 'center',
                }}>
                <div
                    id="drawPaint"
                    style={{
                        height: '86vh',
                        position: 'relative',
                        overflow: 'auto',
                        width: widthE,
                    }}>
                    <img 
                        style={{
                            position: 'absolute',
                            display: 'flex',
                            width: widthE,
                            height: heightE,
                            transform: `scale(${scale}) rotate(${rotationAngle}deg)`
                        }}
                        src={url} />
                    <canvas
                        style={{
                            position: 'absolute',
                            display: 'flex',
                            zIndex: 1,
                            transform: `scale(${scale}) rotate(${rotationAngle}deg)`
                        }}
                        ref={canvasRef} 
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        id="canvas"
                        width={widthE}
                        height={heightE}>
                        您的浏览器不支持 canvas 标签
                    </canvas>
                </div>
            </div>
        </Spin>
    );
};

export default DrawingBoard;