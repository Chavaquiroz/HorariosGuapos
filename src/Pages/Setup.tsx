import { useEffect, useState } from "react";
import { Box, Button, Spacer, Flex, Center, HStack } from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { LuMoon, LuSun } from "react-icons/lu";
import { RadioCard } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom"

type Carrera = "licf" | "ingf" | "ingb" | "ingqs" | "";
type Semestre = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "";
type Horario = "temprano" | "tarde" | "huecos" | "menosdias" | "x" | "";
type Optimizacion = "corriente" | "adelantar" | "plan" | "";

const carreras = [
  { value: "licf", title: "Física" },
  { value: "ingf", title: "Ingeniería Física" },
  { value: "ingb", title: "Ingeniería Biomédica" },
  { value: "ingqs", title: "Ingeniería Química " },
];

const horario = [
  { value: "temprano", title: "Clases lo más temprano posible" },
  { value: "tarde", title: "Clases lo más tarde posible" },
  { value: "huecos", title: "NO horas libres" },
  { value: "menosdias", title: "Días libres" },
  { value: "x", title: "No tengo preferencias"}
];

const semestre = [
  { value: "1", title: "1ro" },
  { value: "2", title: "2do" },
  { value: "3", title: "3ro" },
  { value: "4", title: "4to" },
  { value: "5", title: "5to" },
  { value: "6", title: "6to" },
  { value: "7", title: "7mo" },
  { value: "8", title: "8vo" },
  { value: "9", title: "XD" },
];

const optimizacion = [
  { value: "corriente", title: "Ponerme al corriente" },
  { value: "adelantar", title: "Adelantar materias" },
  { value: "plan", title: "Seguir el plan curricular" },
];

export function Setup() {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("black", "white");

  const [selectedCarrera, setSelectedCarrera] = useState<Carrera>(() => {
    const stored = localStorage.getItem("carrera");
    return stored !== null ? (stored as Carrera) : "";
  });

  const [selectedSemestre, setSelectedSemestre] = useState<Semestre>(() => {
    const stored = localStorage.getItem("semestre");
    return stored !== null ? (stored as Semestre) : "";
  });

  const [selectedHorario, setSelectedHorario] = useState<Horario>(() => {
    const stored = localStorage.getItem("horario");
    return stored !== null ? (stored as Horario) : "";
  });

  const [selectedOptimizacion, setSelectedOptimizacion] = useState<Optimizacion>(() => {
    const stored = localStorage.getItem("optimizacion");
    return stored !== null ? (stored as Optimizacion) : "";
  });

  useEffect(() => {
    if (selectedCarrera) {
      localStorage.setItem("carrera", selectedCarrera);
    }
    if (selectedSemestre) {
        const valueToStore = selectedSemestre === "9" ? "8" : selectedSemestre;
        localStorage.setItem("semestre", valueToStore);
    }
    if (selectedHorario) {
        localStorage.setItem("horario", selectedHorario);
    }
    if (selectedOptimizacion) {
        localStorage.setItem("optimizacion", selectedOptimizacion);
    }
  }, [selectedCarrera, selectedSemestre, selectedHorario, selectedOptimizacion]);

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


      <Box>
        <Spacer />
        <Center>
          <RadioCard.Root
            colorPalette="teal"
            variant="subtle"
            width={800}
            value={selectedCarrera}
            onValueChange={(details) => setSelectedCarrera(details.value as Carrera)}
          >
            <Center>
              <RadioCard.Label fontSize={20}>¿Qué carrera cursas?</RadioCard.Label>
            </Center>
            <HStack align="stretch">
              {carreras.map((item) => (
                <RadioCard.Item key={item.value} value={item.value}>
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl>
                    <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                    <RadioCard.ItemIndicator />
                  </RadioCard.ItemControl>
                </RadioCard.Item>
              ))}
            </HStack>
          </RadioCard.Root>
        </Center>

        {/* Las otras preguntas siguen igual, aún sin guardar en localStorage */}
        <Center>
          <RadioCard.Root colorPalette="teal" variant="subtle" width={800} defaultValue="next"
          value={selectedSemestre} onValueChange={(details) => setSelectedSemestre(details.value as Semestre)}>
            <Box h="40px" />
            <Center>
              <RadioCard.Label fontSize={20}>¿Qué semestre vas a cursar?</RadioCard.Label>
            </Center>
            <HStack align="stretch">
              {semestre.map((item) => (
                <RadioCard.Item key={item.value} value={item.value}>
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl>
                    <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                    <RadioCard.ItemIndicator />
                  </RadioCard.ItemControl>
                </RadioCard.Item>
              ))}
            </HStack>
          </RadioCard.Root>
        </Center>
        
        <Center>
          <RadioCard.Root colorPalette="teal" variant="subtle" width={800} defaultValue="next"
            value={selectedHorario}
            onValueChange={(details) => setSelectedHorario(details.value as Horario)}>
            <Box h="40px" />
            <Center>
              <RadioCard.Label fontSize={20}>¿Alguna preferencia de horario?</RadioCard.Label>
            </Center>
            <HStack align="stretch">
              {horario.map((item) => (
                <RadioCard.Item key={item.value} value={item.value}>
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl>
                    <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                    <RadioCard.ItemIndicator />
                  </RadioCard.ItemControl>
                </RadioCard.Item>
              ))}
            </HStack>
          </RadioCard.Root>
        </Center>

        <Center>
          <RadioCard.Root colorPalette="teal" variant="subtle" width={800} defaultValue="next"
            value={selectedOptimizacion}
            onValueChange={(details) => setSelectedOptimizacion(details.value as Optimizacion)}>
            <Box h="40px" />
            <Center>
              <RadioCard.Label fontSize={20}>¿Qué optimización preferirías?</RadioCard.Label>
            </Center>
            <HStack align="stretch">
              {optimizacion.map((item) => (
                <RadioCard.Item key={item.value} value={item.value}>
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl>
                    <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                    <RadioCard.ItemIndicator />
                  </RadioCard.ItemControl>
                </RadioCard.Item>
              ))}
            </HStack>
          </RadioCard.Root>
        </Center>
        
        

        <Box h="40px" />
        <Button 
                  bg={bg}
                  color={color}
                  borderColor={color}
                  borderWidth="1px"
                  onClick={() => navigate("/")}
                >
                  Atrás
                </Button>
        <Link to= "/Config">
        <Button
          type="submit"
          bg={bg}
          color={color}
          borderColor={borderColor}
          disabled={
            !selectedCarrera || !selectedSemestre || !selectedHorario || !selectedOptimizacion
          }
        >
          Siguiente
        </Button>
        </Link>
        
      </Box>
    </Box>
  );
}
