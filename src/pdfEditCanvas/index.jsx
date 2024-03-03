import React, { useState, useRef } from "react";
import { usePDFData } from "./components/usePdf";
import DrawCanvas from './components/drawCanvas';
import { message, Input, Spin } from "antd";
import {
  ArrowLeftOutlined, 
  ArrowRightOutlined,
  RedoOutlined,
  UndoOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';

const PdfEditCanvas = (props) => {
    const { loading, urls } = usePDFData({src: props.src});
    const [currentPage, setCurrentPage] = useState(0);
    const [canvasList, setCanvasList] = useState([]);
    const [widthE, setWidthE] = useState(550);
    const [heightE, setHeightE] = useState(779);
    const [rotationAngle, setRotationAngle] = useState(0);
    const [scale, setScale] = useState(1);
    const canvasRef = useRef(null);

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
  
    return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
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