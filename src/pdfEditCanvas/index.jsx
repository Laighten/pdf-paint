import React, { useState, useRef } from "react";
import { usePDFData } from "./components/usePdf";
import DrawCanvas from './components/drawCanvas';
import SavePdf from './components/savePdf';
import { message, Input, Spin, Button } from "antd";
import {
  ArrowLeftOutlined, 
  ArrowRightOutlined,
  RedoOutlined,
  UndoOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';

const OPERATE_ENUM = {
  MOSAIC: 1,
  ERASER: 2
}

const PdfEditCanvas = (props) => {
    const { loading, urls } = usePDFData({src: props.src});
    const [currentPage, setCurrentPage] = useState(0);
    const [canvasList, setCanvasList] = useState([]);
    const [widthE, setWidthE] = useState(550);
    const [heightE, setHeightE] = useState(779);
    const [rotationAngle, setRotationAngle] = useState(0);
    const [scale, setScale] = useState(1);
    const canvasRef = useRef(null);
    const [status, setStatus] = useState(OPERATE_ENUM.MOSAIC);
    const [uploading, setUploading] = useState(false);

    if (loading) {
        return (
          <Spin tip="Loading" size="large">
            <div style={{
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }} />
          </Spin>
        )
    }

    const nextPage = (currentPage) => {
      if (currentPage >= urls?.length - 1){
        message.warning('已经是最后一页');
        return;
      }
      setCurrentPage(currentPage + 1);
    }

    const prePage = (currentPage) => {
      if (currentPage <= 0){
        message.warning('已经是第一页');
        return;
      }
      setCurrentPage(currentPage - 1);
    }

    // 单文本复原
    const clear = () => {
      const canvas = canvasRef.current;
      const cxt = canvas.getContext('2d');
      cxt.clearRect(0, 0, widthE, heightE); //清除画布，左上角为起点
    };

    // 所有文本复原——清除canvasList即可
    const clearAll = () => {
        clear();
        setCanvasList([]);
        setCurrentPage(0); // 回到首页
    };
  
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
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
        <DrawCanvas
          key={currentPage}
          currentPage={currentPage}
          url={urls[currentPage]}
          canvasList={canvasList}
          setCanvasList={setCanvasList}
          urls={urls}
          canvasRef={canvasRef}
          setCurrentPage={setCurrentPage} 
          widthE={widthE}
          heightE={heightE} 
          rotationAngle={rotationAngle}
          scale={scale}
          OPERATE_ENUM={OPERATE_ENUM}
          status={status}
          uploading={uploading}
          />
        <div 
          style={{
            height: '4vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1vh'
          }}>
            <ArrowLeftOutlined 
                onClick={() => prePage(currentPage)}
                style={{
                    width: '20px',
                    marginLeft: '10vw'
                }} />
            <FullscreenOutlined 
              onClick={() => {
                setScale(prevScale => prevScale * 1.2);
                setWidthE(prevScale => prevScale * 1.2);
                setHeightE(prevScale => prevScale * 1.2);
              }}
              style={{
                width: '20px',
                marginLeft: '10px'
              }}/>
            <UndoOutlined 
              onClick={() => {
                setRotationAngle(prevAngle => (prevAngle - 90) % 360);
              }}
              style={{
                width: '20px',
                marginLeft: '10px'
              }} />
            <Input 
                disabled
                value={`${currentPage + 1 }/${urls.length}`}
                style={{
                    width: '100px',
                    height: '30px',
                    textAlign: 'center'
                }}/>
            <RedoOutlined
              onClick={() => {
                setRotationAngle(prevAngle => (prevAngle + 90) % 360);
              }}
              style={{
                width: '20px',
              }} />
            <FullscreenExitOutlined 
              onClick={() => {
                setScale(prevScale => prevScale / 1.2);
                setWidthE(prevScale => prevScale / 1.2);
                setHeightE(prevScale => prevScale / 1.2);
              }}
              style={{
                width: '20px',
              }}/>
            <ArrowRightOutlined
                onClick={() => nextPage(currentPage, canvasRef)}
                style={{
                    width: '20px',
                    marginRight: '10vw'
                }} />
          </div> 
      </div>
    );
};

export default PdfEditCanvas;