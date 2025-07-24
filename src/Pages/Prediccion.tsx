import { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import type { FC } from 'react';
import { Box, Center, Container, Heading, VStack, Flex, Button, Grid, GridItem, 
   Text, Table, HStack, IconButton, Image, 
} from '@chakra-ui/react';
import { Card } from '@chakra-ui/card';
import { Fade } from '@chakra-ui/transition';
import data from "./data.json";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { LuMoon, LuSun } from "react-icons/lu";
import './prediccion.css'; // O './styles.css'
import { useNavigate } from "react-router-dom";
import { SiGoogleplay, SiGithub, SiInstagram, SiFacebook } from "react-icons/si";
import afifImage from '../assets/afifgod.png';



import type { Course, Scheduler, Session } from './types';

 
const descargarPDF = () => {
  const elemento = document.getElementById('tabla-horario');
  if (!elemento) return;
  elemento.scrollIntoView({ behavior: 'auto', block: 'start' });

  html2pdf()
    .set({
      
      filename: 'horariosex.pdf',
      image: { type: 'pdf', quality: .98 },
      html2canvas: { scale: 2 },
      jsPDF: { margin:{top:5, left:.3,bottom:.3,right:.3}, unit: 'in', format: 'letter', orientation: 'landscape'
      }
    })
    .from(elemento)
    .save()
};

const Week: FC<{ scheduler: Scheduler }> = ({ scheduler }) => {
  const bgcolor = useColorModeValue('#99f6e4','#114240');
  const fontcolor = useColorModeValue('#0c5d56', '#5eead4');
  const formatName = (name: string) =>
    name.split(' ').length >= 3
      ? name.split(' ').map(word => word[0]).join('.') + '.'
      : name;

  return (
    <Box fontSize={{ lg: "md", md: "sm", base: "xs" }} width="100%">
      <Center>
        <Box w="100%"  overflowX="auto">
          <Grid templateColumns="repeat(7, 1fr)" gap={4}>
            <GridItem></GridItem>
            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day) => (
              <GridItem key={day} as="b" textAlign="center">
                {day}
              </GridItem>
            ))}

            {[...Array(12)].map((_, i) => (
              <GridItem rowStart={i + 2} key={i}>
                <Text>{i + 8}:00 {i + 8 < 12 ? "am" : "pm"}</Text>
              </GridItem>
            ))}

            {scheduler.courses.map((course: Course) =>
              course.sessions.map((session: Session, i: number) => (
                <GridItem bg={bgcolor}
                  key={`${course.name}-${i}`}
                  rowStart={parseInt(session.begin.split(':')[0]) - 6}
                  rowEnd={parseInt(session.end.split(':')[0]) - 6}
                  colStart={session.day + 1}
                >
                  <Card
                    variant="filled"
                    p={2}
                    rounded="md"
                    height="full"
                    boxShadow="base"
                  >
                    <Text fontWeight="bold" fontSize={'xs'} whiteSpace="normal" color={fontcolor}>
                      {formatName(course.name)}
                    </Text>
                    <Text fontSize={"2xs"} color={fontcolor}>{session.place} </Text>
                  </Card>
                </GridItem>
              ))
            )}
          </Grid>
        </Box>
      </Center>
    </Box>
  );
};

const Prediccion: FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const navigate = useNavigate();
  const filterValue = useColorModeValue('none', 'invert(1)');


  const [scheduler, setScheduler] = useState<Scheduler | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("mejorCombinacion");

    if (stored) {
      try {
        const materiasGuardadas: { nombre: string; grupo: string }[] = JSON.parse(stored);

        const cursosRecuperados: Course[] = materiasGuardadas.map(({ nombre, grupo }) => {
          const encontrado = data.courses.find(
            (materia: Course) =>
              materia.name.toLowerCase() === nombre.toLowerCase() &&
              materia.group.toLowerCase() === grupo.toLowerCase()
          );

          if (!encontrado) {
            console.warn(`No se encontró la materia: ${nombre} grupo: ${grupo}`);
          }

          return encontrado;
        }).filter((curso): curso is Course => !!curso);

        setScheduler({ courses: cursosRecuperados });
      } catch (e) {
        console.error("Error al recuperar mejorCombinacion desde localStorage:", e);
      }
    }
  }, []);

  return (
    <Box minH="100vh" display="flex" 
    flexDirection="column" alignItems="center" bg={bg} color={color}>
      <Flex
        h={16}
        p={4}
        w="100%"
        justifyContent="space-between"
      >
        <Center fontWeight="bold">Algo cherry</Center>
        <Button onClick={toggleColorMode} bg={bg} color={color}>
          {colorMode === "light" ? <LuMoon /> : <LuSun />}
        </Button>
      </Flex>

      <Center my={10}>
        <Heading as="h1" size="2xl" fontFamily={"Mochiy Pop One"}>Mejor combinación</Heading>
      </Center>

      <Container maxW="container.xl" w="100%" overflowX="auto">
        <Fade in={!!scheduler} >
          {
            scheduler && (
              <VStack >
                <Box
                  borderWidth="1px"
                  borderColor={borderColor}
                  rounded="md"
                  p={4}
                  w="100%"
                  maxW="7xl"
                  overflowX="auto"
                >
                  {/* Aquí podrías agregar resumen de materias, créditos, etc. */}
                <Table.Root size="sm" interactive >
                  <Table.Header>
                    <Table.Row bg={bg}>
                      <Table.ColumnHeader borderColor={borderColor} textAlign="center">ID</Table.ColumnHeader>
                      <Table.ColumnHeader borderColor={borderColor} textAlign="center">Nombre</Table.ColumnHeader>
                      <Table.ColumnHeader borderColor={borderColor} textAlign="center">Grupo</Table.ColumnHeader>
                      <Table.ColumnHeader borderColor={borderColor} textAlign="center">Profesor</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body >
                    {scheduler.courses.map((course:Course) => (
                      <Table.Row bg={bg} key={course.id}>
                        <Table.Cell borderColor={borderColor} textAlign="center">{course.id}</Table.Cell>
                        <Table.Cell borderColor={borderColor} textAlign="center">{course.name}</Table.Cell>
                        <Table.Cell borderColor={borderColor} textAlign="center">{course.group}</Table.Cell>
                        <Table.Cell borderColor={borderColor} textAlign="center">{course.teacher}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              
            
                </Box>

                <Center w="100%">
                  <Box  id="tabla-horario"
                    borderColor={borderColor}
                    borderWidth="1px"
                    rounded="md"
                    p={4}
                    w="100%"
                    maxW="6xl"
                    overflowX="auto"
                  >
                    <Week scheduler={scheduler} />
                  </Box>
                </Center>
              </VStack>
            )
          }
        </Fade>
      </Container>

      {
        !scheduler && (
          <Center my={10}>
            <Heading size="md">No hay horario guardado</Heading>
          </Center>
        )
      }
      <Box h="40px"></Box>
      <Box >
            <Center>
              <HStack align="center" overflowX="auto" maxW="100%">
                <Button 
                  bg={bg}
                  color={color}
                  borderColor={color}
                  borderWidth="1px"
                  onClick={() => navigate("/Config")}
                >
                  Atrás
                </Button>
                <Button onClick={() => {
                    if (colorMode === 'dark') {
                      toggleColorMode();
                      
                    }
                    descargarPDF();
                  }}
                  bg={bg}
                  color={color}
                  borderColor={color}
                  borderWidth="1px"
                >
                  Descargar PDF
                </Button>
                <Button 
                  bg={bg}
                  color={color}
                  borderColor={color}
                  borderWidth="1px"
                  onClick={() => navigate("/Setup")}
                >
                  Intentar de nuevo
                </Button>
                <Button 
                  bg={bg}
                  color={color}
                  borderColor={color}
                  borderWidth="1px"
                  onClick={() => navigate("/Hacedor")}
                >
                  PROBAR EL HACEDOR
                </Button>
              </HStack>
             </Center>
      </Box>
      <Box h={5} />
      <Center>
      <HStack>
      
      <IconButton as="a"
          //@ts-expect-error It will not detect href as good, but it works
          href="https://play.google.com/store/apps/details?id=com.prometeo.tes"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="PROMETEO"
          bg={bg}
          color={useColorModeValue("teal.600", "white")}
          _hover={{
              bg: useColorModeValue("teal.100", "teal.700"), // tono suave en hover
              color: useColorModeValue("teal.700", "teal.200"),
          }}
      >
        <SiGoogleplay />
      </IconButton>
      <IconButton as="a"
          //@ts-expect-error It will not detect href as good, but it works
          href="https://www.instagram.com/chavasado/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          bg={bg}
          variant="ghost"
          color={useColorModeValue("pink.500", "white")}
          _hover={{
              bg: useColorModeValue("pink.100", "pink.700"),
              color: useColorModeValue("pink.600", "pink.300"),
          }}
      >
        <SiInstagram />
      </IconButton>
      <IconButton as="a"
          //@ts-expect-error It will not detect href as good, but it works
          href="https://github.com/Chavaquiroz"
          target="_blank"
          rel="noopener noreferrer" 
          aria-label="GitHub"
          bg={bg}
          variant="ghost"
          color={useColorModeValue("gray.800", "white")}
          _hover={{
              bg: useColorModeValue("gray.100", "gray.700"),
              color: useColorModeValue("gray.900", "gray.100"),
          }}
      >
        <SiGithub />
      </IconButton>
      <IconButton as="a"
          //@ts-expect-error It will not detect href as good, but it works
          href="https://www.facebook.com/OficialAFIF"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          bg={bg}
          variant="ghost"
          color={useColorModeValue("blue.600", "white")}
          _hover={{
              bg: useColorModeValue("blue.100", "blue.700"),
              color: useColorModeValue("blue.700", "blue.300"),
          }}
      >
        <SiFacebook />
      </IconButton>
      <IconButton as="a"
          //@ts-expect-error It will not detect href as good, but it works
          href="https://www.instagram.com/afif_ug/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="AFIF"
          variant="ghost"
          _hover={{
              bg: useColorModeValue("yellow.100", "yellow.700"),
              color: useColorModeValue("yellow.700", "yellow.300"),
          }}
      >
          <Image src={afifImage} filter={filterValue}/>
      </IconButton>
      </HStack>
      </Center>
    </Box>
  );
};

export default Prediccion;
