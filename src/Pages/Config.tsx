/* eslint-disable @typescript-eslint/no-explicit-any */

import { Box, Button, Spacer, Flex, Center, CheckboxCard, HStack, VStack, FileUpload, Input, CloseButton, InputGroup,} from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { LuMoon, LuSun, LuUpload } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


import { ingf } from "@/Planes/ingf";
import { licf } from "@/Planes/licf";
import { ingb } from "@/Planes/ingb";
import { ingqs } from "@/Planes/ingqs";
import { extractPdfText } from "./PDFextractor";
import { generador } from "./predictorhorario";


const planes = {
  ingf,
  licf,
  ingb,
  ingqs,
};


export function Config() {
  const [clavesSeleccionadas, setClavesSeleccionadas] = useState<Set<string>>(new Set());

  const storedcarrera = localStorage.getItem("carrera")
  const materiasPorCarrera = planes[storedcarrera as keyof typeof planes];
  //const storedsemestre = localStorage.getItem("semestre");
  //const storedoptimizacion = localStorage.getItem("optimizacion");

  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("black", "white");
  
  
  const readpdf = async (file: any) => {
    const selectedFile = file.files?.[0];
    if (!selectedFile) return;

    try {
      const extracted = await extractPdfText(selectedFile);
      const matches = extracted.match(/\b[A-Z]{4}\d{5}\b/g) || [];
      setClavesSeleccionadas(new Set(matches));
      console.log(matches);
      console.log(clavesSeleccionadas)
    } catch (err) {
      console.error("Error al extraer texto del PDF:", err);
    }
  };

  return (
    <Box className="App" bg={bg} minW="100vw" minH="100vh" color={color}>
      <Flex h={16} p="4">
        <Center>Algo cherry</Center>
        <Spacer />
        <Box>
          <Button onClick={toggleColorMode} bg={bg} color={color}>
            {colorMode === "light" ? <LuMoon /> : <LuSun />}
          </Button>
        </Box>
      </Flex>

      <h2 style={{ textAlign: "center" }}>Ingresa tu información</h2>


      <Center>
        <HStack align="start" overflowX="auto" maxW="100%">
          {materiasPorCarrera && Object.entries(materiasPorCarrera).map(([insc, materias]) => (

            <VStack key={insc} align="center" minW={175}>
              <CheckboxCard.Root disabled width="100%">
                <CheckboxCard.HiddenInput />
                <CheckboxCard.Control w="100%">
                  <CheckboxCard.Label
                    w="100%"
                    display="flex"
                    justifyContent="center"
                    textAlign="center"
                    flexDirection="column"
                  >
                    Semestre {insc}
                  </CheckboxCard.Label>
                </CheckboxCard.Control>
              </CheckboxCard.Root>

              
              {materias.map((m) => (
                
                <CheckboxCard.Root
                  colorPalette="teal"
                  variant="subtle"
                  fontSize={15}
                  key={m.clave}
                  checked={clavesSeleccionadas.has(m.clave)}
                  onCheckedChange={(details) => {
                    const checked = details.checked;
                    const nuevas = new Set(clavesSeleccionadas);
                    if (checked) nuevas.add(m.clave);
                    else nuevas.delete(m.clave);
                    setClavesSeleccionadas(nuevas);
                  }}
                  width="100%"
                >
                  <CheckboxCard.HiddenInput />
                  <CheckboxCard.Control w="100%">
                    <CheckboxCard.Label
                      w="100%"
                      display="flex"
                      justifyContent="center"
                      textAlign="center"
                      flexDirection="column"
                      whiteSpace="normal"
                    >
                      {m.materia}
                    </CheckboxCard.Label>
                  </CheckboxCard.Control>
                </CheckboxCard.Root>
              ))}
            </VStack>
          ))}
        </HStack>
      </Center>

      <Box h="40px" />
      <Center>
        <HStack align="center" overflowX="auto" maxW="100%">
          <Button
            type="button"
            bg={bg}
            color={color}
            borderColor={borderColor}
            onClick={() => navigate("/Setup")}
          >
            Atrás
          </Button>
          <Button bg={bg} color={color} borderColor={borderColor} onClick={async () => {
            const lista = Array.from(clavesSeleccionadas);
            const respuesta = await generador(lista);
            const mejorCombinacion = respuesta['segundoFiltro'];
            localStorage.setItem('mejorCombinacion',JSON.stringify(mejorCombinacion));
            navigate("/Prediccion");

            console.log("Mejor combinación generada:", mejorCombinacion);
          }}>
            Optimizar
          </Button>

          <FileUpload.Root
            accept={"application/pdf"}
            bg={bg}
            borderColor={borderColor}
            gap="1"
            maxWidth="300px"
            onFileAccept={(file) => readpdf(file)}>
            <FileUpload.HiddenInput />
            <FileUpload.Label bg={bg} borderColor={borderColor}>
              Upload file
            </FileUpload.Label>

            <InputGroup
              bg={bg}
              borderColor={borderColor}
              startElement={<LuUpload />}
              endElement={
                <FileUpload.ClearTrigger asChild>
                  <CloseButton
                    me="-1"
                    size="xs"
                    variant="plain"
                    focusVisibleRing="inside"
                    focusRingWidth="2px"
                    pointerEvents="auto"
                    bg={bg}
                    borderColor={borderColor}
                  />
                </FileUpload.ClearTrigger>
              }
            >
              <Input asChild bg={bg} borderColor={borderColor}>
                <FileUpload.Trigger>
                  <FileUpload.FileText
                    lineClamp={1}
                    bg={bg}
                    borderColor={borderColor}
                  />
                </FileUpload.Trigger>
              </Input>
            </InputGroup>
          </FileUpload.Root>
        </HStack>
      </Center>
    </Box>
  );
}
