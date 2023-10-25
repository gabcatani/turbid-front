import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

type IResponseData = {
  codigoAnaliseDois: string,
  codigoAnaliseUm: string
}

type IAnalysisData = {
  codigoAnaliseUm: string;
  codigoAnaliseDois: string;
};


const Screen = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1<{ color?: string }>`
  color: ${props => props.color || '#BF4F74'};
`;

const Image = styled.img`
  margin-top: 20px;
  max-width: 800px;
  max-height: 800px;
  cursor: pointer;
  margin: 20px;
`;

const UploadContainer = styled.div`
  padding: 20px;
  width: 300px;
  border: 2px dashed #999;
  text-align: center;
  margin: 20px 0;
  cursor: pointer;
  position: relative;
`;

const StyledButton = styled.button<{ color?: string }>`
  background-color: ${props => props.color || '#007BFF'};
  color: white;
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px;
  margin-top: 30px;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const InfoText = styled.p`
  margin: 10px 0;
  font-size: 14px;
`;

const Loader = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function App() {
  const [responseData, setResponseData] = useState<IResponseData | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [habilitySend, setHabilitySend] = useState<boolean>(true)
  const [blockCLick, setBlockClick] = useState<boolean>(false)
  const [coordsFirstClick, setCoordsFirstClick] = useState<number[]>([]);
  const [coordsSecondClick, setCoordsSecondClick] = useState<number[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const clearAllParameters = () => {
    setResponseData(null);
    setCoordsFirstClick([]);
    setCoordsSecondClick([]);
    setImage(null);
    setPoints([]);
    setHabilitySend(true)
    setBlockClick(false)
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      const reader = new FileReader();
      reader.onloadend = function() {
        const fullBase64 = reader.result as string;
        setImageBase64(fullBase64.split(",")[1]);
      }      
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (points.length === 0) {
      setBlockClick(false)
    }
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);  
      const y = Math.round(e.clientY - rect.top);  
      const newPoints = [...points, { x, y }];
      setPoints(newPoints);
      
      if (newPoints.length === 2) {
        setHabilitySend(false)
        const roundedFirstCoords = [Math.round(newPoints[0].x), Math.round(newPoints[0].y)]; 
        const roundedSecondCoords = [Math.round(newPoints[1].x), Math.round(newPoints[1].y)]; 
        setCoordsFirstClick(roundedFirstCoords);
        setCoordsSecondClick(roundedSecondCoords);
        setBlockClick(true)
        setPoints([]);
      }
    }
  };
  
  const handleButtonClick = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post('https://8137-2804-1100-8b04-3b01-8cfa-de26-4a9b-677.ngrok-free.app/evaluate_water', { coord_copo: coordsFirstClick, coord_fundo: coordsSecondClick, image_base64: imageBase64});
      const analyses = response.data as IAnalysisData;
      setResponseData({
        codigoAnaliseDois: analyses.codigoAnaliseDois,
        codigoAnaliseUm: analyses.codigoAnaliseUm})
    } catch (error) {
      console.error('An error occurred while sending data:', error);
    }
    finally {
      setIsLoading(false)
    }
  };

  return (
    <Screen>
      {isLoading ?
      <>
      <Loader /> 
      <Title>Analisando dados...</Title>
      </> 
      : (<>
      {responseData ? 
          <Title style={{fontSize: '2em'}}> 
          Resultado dos dados enviados <br />
          - <br />
          <span style={{color: 'gray'}}>OpenCV (teste de coloração dos pixels):</span> <span style={{color: 'green'}}>{responseData.codigoAnaliseUm}</span> <br />
          - <br />
          <span style={{color: 'white'}}>Modelo de IA:</span> <span style={{color: 'blue'}}>{responseData.codigoAnaliseDois}</span>
        </Title>
          : 
          <>
          <Title color='white'>Envie sua imagem!</Title> 
          {blockCLick ? 
            <Title>Dados coletados</Title> 
            : 
            <>
              {!image ? null : (points.length === 0 ? <Title color='violet'>Clique no Copo</Title> : <Title color='violet'>Clique no Fundo Da Imagem</Title>)}
            </>
          }
            {!image ? 
          <UploadContainer onClick={() => {
            const fileInput = document.getElementById('fileInput');
              if (fileInput) {
                fileInput.click();
              }
            }}>
              Selecione um arquivo ou arraste e solte aqui
            <InfoText>Envie arquivos .png, .jpg ou .jpeg | Tam. máx.: 25 MB.</InfoText>
            <FileInput type="file" id="fileInput" onChange={handleImageChange} accept="image/*" />
          </UploadContainer>
          : null}

          {image && <Image ref={imageRef} src={image} alt="Preview" onClick={handleImageClick} />}
          <StyledButton disabled={habilitySend} onClick={handleButtonClick}>Verificar Turbidez</StyledButton>
          </>
        }
          <StyledButton color="red" onClick={clearAllParameters}>Limpar Dados</StyledButton>
        </>
          )}
      </Screen>
  )
}

export default App