/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from 'react';
import { useState } from 'react'
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import rawData from './data.json';
import { useNavigate } from 'react-router-dom';
import type { Scheduler, Course, Session } from './types';
import { Card } from "@chakra-ui/card";
import { Box, Button, HStack, Center, Container, Text, Grid, GridItem, Flex, Heading, Input, Spacer, Table, Image,
   Tag, TagLabel, VStack, Wrap, IconButton, Accordion, InputGroup, CloseButton, TagRoot } from '@chakra-ui/react';

import { AddIcon, RepeatIcon } from '@chakra-ui/icons';
import { LuMoon, LuSun } from 'react-icons/lu';
import { Fade } from '@chakra-ui/transition';
import afifImage from '../assets/afifgod.png';
import { SiGoogleplay, SiGithub, SiInstagram, SiFacebook, SiQlik } from "react-icons/si";

const Week: FC<{ scheduler: Scheduler }> = ({ scheduler }) => {
  const bgcolor = useColorModeValue('#99f6e4','#114240');
  const fontcolor = useColorModeValue('#0c5d56', '#5eead4');
  const formatName = (name: string) =>
    name.split(' ').length >= 3
      ? name.split(' ').map(word => word[0]).join('.') + '.'
      : name;

    return (
    <Box fontSize={{ lg: "md", md: "sm", base: "xs" }} width="100%">
      <Box overflowX="auto" width="100%" maxWidth="100vw">
        <Box minWidth="900px">
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
                <GridItem
                  bg={bgcolor}
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
                    <Text fontSize={"2xs"} color={fontcolor}>{session.place}</Text>
                  </Card>
                </GridItem>
              ))
            )}
          </Grid>
        </Box>
      </Box>
    </Box>

  );
};

const Hacedor: FC = () => {
  const navigate = useNavigate();
  const bgcolor = useColorModeValue('#99f6e4','#114240');
  const invertcolor = useColorModeValue('#03c7c0ff','#99f6e4');
  //const fontcolor = useColorModeValue('#0c5d56', '#5eead4');
  const avalibleCourses: Course[] = rawData.courses; 
  const avalibleUDAs: string[] = rawData.options; 
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("white", "gray.800");
  const filterValue = useColorModeValue('none', 'invert(1)');
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Hooks
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [sugestedCourses, setSugestedCourses] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [schedulers, setSchedulers] = useState<Scheduler[]>([]);
  const color = useColorModeValue("black", "white");
  const [god, setGod] = useState(false);


  const generateSchedulers = (): void => {
    const time2num = (time: string): number => parseInt(time.replace(':', ''))
    

    const sessionsDisjoin = (x: Session, y: Session): boolean => {
      if (x.day !== y.day) return true;

      const x_begin: number = time2num(x.begin);
      const x_end: number = time2num(x.end);
      const y_begin: number = time2num(y.begin);
      const y_end: number = time2num(y.end);

      const begin = Math.min(x_begin, y_begin);
      const end = Math.max(x_end, y_end);

      return end - begin >= x_end - x_begin + y_end - y_begin;
    }

    const coursesDisjoin = (x: Course, y: Course): boolean => {
      let disjoin = true;

      x.sessions.map((xSession: Session) => {
        y.sessions.map((ySession: Session) => {
          if (!sessionsDisjoin(xSession, ySession)) disjoin = false;
          return null;
        })
        return null;
      });

      return disjoin;
    }

    const isAValidScheduler = (scheduler: Scheduler): boolean => {
      let isValid = true;
      scheduler.courses.map((i: Course) => {
        scheduler.courses.map((j: Course) => {
          if (i.id !== j.id) if (!coursesDisjoin(i, j)) isValid = false;
          return null;
        });
        return null;
      });

      return isValid;
    }

    const cartesian = (...a: any[]) => a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));

    const classes = selectedCourses.map(className => avalibleCourses.filter(course => className === course.name));

    let validSchedulers: Scheduler[];
    if (selectedCourses.length === 0)
      validSchedulers = [];
    else if (selectedCourses.length === 1)
      validSchedulers = classes[0].map(x => { return { courses: [x] } });
    else {
      const schedulers = cartesian(...classes).map((courses: Course[]) => { return { courses } });
      validSchedulers = schedulers.filter((scheduler: Scheduler) => isAValidScheduler(scheduler));
    } 

    const possibleCourses: Course[] = avalibleCourses
    .filter((course: Course) => 
            validSchedulers.map(scheduler => 
                                isAValidScheduler({ courses: [...scheduler.courses, course] })
                               ).includes(true)
           );

           let sugestions = possibleCourses.map(course => course.name);
           sugestions = sugestions
           .filter((value, index) => sugestions.indexOf(value) === index)
           .filter(name => !selectedCourses.includes(name));

           setSchedulers(validSchedulers);
           setSugestedCourses(sugestions);
           setGod(validSchedulers.length === 0);
  }

  // Render
  return (
    <Box className="App" bg={bg} minW="100vw" minH="100vh" maxW={'100%'} color={color} overflowX="hidden">
      <Flex h={16} p="4">
        <Center>Algo cherry</Center>
        <Spacer />

        <Box>
        <Button onClick={toggleColorMode} bg={bg} color={color}>
            {colorMode === "light" ? <LuMoon /> : <LuSun />}
        </Button>
        </Box>
    </Flex>

      <Container centerContent maxW={1000}>
        <Center>
          <h1>Horarios Guapos :v<br/><br/></h1>
        </Center>

        <Center>
          <Wrap>
            {
              selectedCourses.map(course => (
                <Tag.Root key={course} bg={bgcolor} >
                  <TagLabel>{ course }</TagLabel>
                  <CloseButton bg={bgcolor} variant='ghost'  scale={.9}
                      onClick={() => {
                      setSelectedCourses(selectedCourses.filter(x => x !== course));
                      setSchedulers([]);
                    }}
                  />
                </Tag.Root>
              ))
            }

          </Wrap>
        </Center>

          <InputGroup startElement={<SiQlik />}  my={'6'} >
            <Input borderColor={borderColor}
                  rounded="md"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder='Busca tus asignaturas'
            />
          </InputGroup>

        <VStack align="center" justify="center" width="100%">
          {
            searchInput !== '' && avalibleUDAs
            .filter(course => course
                    .toLowerCase()
                    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
                    .includes(searchInput.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')))
                    .filter(course => !selectedCourses.includes(course))
                    .map(course => (
                      <Button bg={bg}
                        color={color}
                        borderColor={color}
                        borderWidth="1px"
                        _hover={{
                            bg: bgcolor,
                        }}
                        key={course}
                        onClick={() => {
                          setSelectedCourses([...selectedCourses, course]);
                          setSearchInput('');
                          setSchedulers([]);
                        }}
                        width='100%'
                        size='sm'
                      >{ course }</Button>
                    ))
          }
        </VStack>

        {
          selectedCourses.length !== 0 ? (
            <Accordion.Root collapsible >
                <Accordion.Item value='sugerencias' >
                    <Accordion.ItemTrigger bg={bg}
                    color={color}
                    borderColor={borderColor}>
                    <Flex flex="1" justify="space-between" align="center" p="2">
                        <Heading size="sm" fontFamily={"Mochiy Pop One"}>Sugerencias</Heading>
                        <Accordion.ItemIndicator />
                    </Flex>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                    <Accordion.ItemBody>
                        <Center>
                        <Wrap>
                            {sugestedCourses.map(course => (
                            <TagRoot  key={course}>
                                <Tag.Label>{course}</Tag.Label>
                                <Tag.EndElement _hover={{
                            color: invertcolor,
                        }}
                                as={AddIcon}
                                onClick={() => {
                                    setSelectedCourses([...selectedCourses, course]);
                                    setSearchInput('');
                                    setSchedulers([]);
                                }}
                                />
                            </TagRoot>
                            ))}
                        </Wrap>
                        </Center>
                    </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>
                </Accordion.Root>

          ) : (<></>)
        }
      </Container>

      <Center>
        <Button
          onClick={() => generateSchedulers()}
          size='lg'
          m='10'
          bg={bg}
          color={color}
          borderColor={color}
          borderWidth="1px"
        >
        <RepeatIcon />
        Generar
        </Button>
      </Center>

      <Container maxWidth='1400px' centerContent>
        <Fade in={selectedCourses.length !== 0 && schedulers.length > 0}>
          {
            schedulers.map((scheduler: Scheduler, i: number) => (
              <VStack key={i.toString()} align="center" justify="center" width="100%">
                <Heading size='lg' mt='20' fontFamily={'Mochiy Pop One'}>Opción {i + 1}</Heading>
                  <Box overflowX="auto" width="100%" maxWidth="100vw">
                  <Box minWidth="900px" borderWidth='1px' rounded='md' borderColor={borderColor} p='4'>
                    <Table.Root size="sm" interactive>
                      <Table.Header>
                        <Table.Row bg={bg}>
                          <Table.ColumnHeader borderColor={borderColor} textAlign="center">ID</Table.ColumnHeader>
                          <Table.ColumnHeader borderColor={borderColor} textAlign="center">Nombre</Table.ColumnHeader>
                          <Table.ColumnHeader borderColor={borderColor} textAlign="center">Grupo</Table.ColumnHeader>
                          <Table.ColumnHeader borderColor={borderColor} textAlign="center">Profesor</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {scheduler.courses.map((course: Course) => (
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
                </Box>

                <Box
                  borderWidth='1px'
                  borderColor={borderColor}
                  rounded='md'
                  p='4'
                  display="block"
                  width="100%"
                  overflowX="auto"
                >
                  <Week scheduler={scheduler} />
                </Box>
              </VStack>
            ))
          }
        </Fade>
      </Container>

      <Fade in={god}>
        <Center>
          <Heading size={'lg'} my='10' fontFamily={'Mochiy Pop One'}>Llamen a Dios :0</Heading>
        </Center>
      </Fade>
      <Button 
        bg={bg}
        color={color}
        borderColor={color}
        borderWidth="1px"
        onClick={() => navigate("/")}
      >
        Atrás
      </Button>
      <Button 
        bg={bg}
        color={color}
        borderColor={color}
        borderWidth="1px"
        onClick={() => navigate("/Setup")}
      >
        PROBAR EL OPTIMIZADOR
</Button>
      <Box h={5} />
      <Center>
      <HStack align="center" justify="center" width="100%">
      
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
}


export default Hacedor;
