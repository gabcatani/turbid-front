import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Screen = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  color: #BF4F74;
`;

const Image = styled.img`
  margin-top: 20px;
  max-width: 400px;
  max-height: 400px;
  cursor: pointer;
`;

function App() {
  const [fristClick, setFristClick] = useState<boolean>(true);
  const [coordsCup, setCoordsCup] = useState<[number, number]>([0, 0]);
  const [coordsBackground, setCoordsBackground] = useState<[number, number]>([0, 0]);
  const [image, setImage] = useState<string | null>(null);
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const toggleClick = () => {
    setFristClick(prevState => !prevState);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      setPoints(prevPoints => {
        const newPoints = [...prevPoints, { x, y }];
        return newPoints.slice(-2);
      });
      toggleClick()
      setCoordsCup([points[0].x, points[0].y]);
      setCoordsBackground([points[1].x, points[1].y]);
      console.log("copo", coordsCup)
      console.log("fora", coordsBackground)
    }
  };
  

  const handleButtonClick = async () => {
    try {
      const response = await axios.post('http://your-backend-url/coordinates', { image_base64: "adasd", coord_copo: coordsCup, coord_fundo: coordsBackground });
      console.log('Data sent successfully:', response.data);
    } catch (error) {
      console.error('An error occurred while sending data:', error);
    }
  };

  return (
    <Screen>
      <Title>
        Envie sua imagem!
      </Title>
      {fristClick ? (
        <Title>
        Click no copo
      </Title>
        ): (
      <Title>
        Click fora do copo
      </Title>
        )}
      <input type="file" onChange={handleImageChange} accept="image/*" />
      {image && <Image ref={imageRef} src={image} alt="Preview" onClick={handleImageClick} />}
      <button onClick={handleButtonClick}>Enviar Coordenadas</button>
    </Screen>
  );
}

export default App;
