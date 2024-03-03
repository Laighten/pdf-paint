import React, { 
    useEffect, useState
} from 'react';
import { Button, Spin } from "antd";
import SavePdf from './savePdf';

const OPERATE_ENUM = {
    MOSAIC: 1,
    ERASER: 2
}

const DrawingBoard = (props) => {
    const { 
        url,
        urls, 
        canvasRef,
        currentPage,
        // savedData, 
        canvasList,
        setCanvasList,
        setCurrentPage,
        widthE,
        heightE,
        rotationAngle,
        scale,
    } = props;
    const [status, setStatus] = useState(OPERATE_ENUM.MOSAIC);
    const [uploading, setUploading] = useState(false);
    let lock = false;
    let isEraser = false;
    let x = [];
    let y = [];
    let clickDrag = [];
    let eraserRadius = 10;  // 橡皮擦粗细
    // let cxt;
    let w;
    let h;
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

    // 单文本复原
    const clear = () => {
        const canvas = canvasRef.current;
        const cxt = canvas.getContext('2d');
        cxt.clearRect(0, 0, w, h); //清除画布，左上角为起点
    };

    // 所有文本复原——清除canvasList即可
    const clearAll = () => {
        clear();
        setCanvasList([]);
        setCurrentPage(0); // 回到首页
    };

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
            containerLeft = e.target.offsetLeft - e.target.scrollLeft;
            containerTop = e.target.offsetTop - e.target.scrollTop;
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const cxt = canvas.getContext('2d');
            cxt.lineJoin = "round"; //context.lineJoin - 指定两条线段的连接方式
            cxt.lineWidth = 5; //线条的宽度
            w = canvas.width; // 取画布的宽
            h = canvas.height; // 取画布的高 
            const drawPaint = document.getElementById('drawPaint');
            containerLeft = drawPaint.offsetLeft;
            containerTop = drawPaint.offsetTop;
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
                id="header"
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '6vh'
                }} >
                <div
                    style={{
                        marginLeft: '5vw'
                    }}>
                    你的合同已自动脱敏，请检查
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: '5vw',
                    color: '#5a7cab'
                }}>
                    <Button
                        onClick={() => {
                            setStatus(OPERATE_ENUM.MOSAIC);
                        }}
                        type={status === OPERATE_ENUM.MOSAIC ? 'default' : 'text'} >
                        <img
                            style={{
                                marginRight: '5px',
                                width: '12px',
                                height: '12px'
                            }}
                            src="https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/31862799102/eb06/fb7c/55f0/9e9378a1079f234321c6aa8750509825.png" />
                        添加马赛克
                    </Button>
                    <Button
                        type={status === OPERATE_ENUM.ERASER ? 'default' : 'text'}
                        onClick={() => {
                            setStatus(OPERATE_ENUM.ERASER);
                        }}
                        style={{ 
                            marginLeft: '10px',
                        }}>
                        <img
                            style={{
                                width: '12px',
                                height: '12px',
                                marginRight: '5px'
                            }}
                            src="https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/31862793838/fd86/645c/76d3/75b01f070d8071b0bf61a72e036f840a.png" />
                        橡皮
                    </Button>
                    <Button
                        type="text"
                        onClick={clearAll}
                        style={{ marginLeft: '10px' }}>
                        文本复原
                    </Button>
                    <SavePdf
                        urls={urls}
                        canvasList={canvasList}
                        setUploading={setUploading}
                        clearAll={clearAll} />
                </div>
            </div>
            <div 
                id="drawPaint"
                style={{
                    position: 'relative',
                    border: '1px solid #e1e3e9',
                    width: '90vw',
                    height: '88vh',
                    overflow: 'scroll',
                    backgroundColor: '#d3d3d3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <img 
                    style={{
                        width: widthE,
                        height: heightE,
                        transform: `scale(${scale}) rotate(${rotationAngle}deg)`
                    }}
                    src={url} />
                <canvas
                    style={{
                        position: 'absolute',
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
        </Spin>
    );
};

export default DrawingBoard;