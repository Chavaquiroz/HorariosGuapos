import { Box, Button, Spacer, Card, Image, Flex, Center, HStack, IconButton} from "@chakra-ui/react"
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode"
import { LuMoon, LuSun } from "react-icons/lu"
import { SiGoogleplay, SiGithub, SiInstagram, SiFacebook } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import afifImage from '../assets/afifgod.png';

export function Login() {

    const { colorMode, toggleColorMode } = useColorMode();
    const bg = useColorModeValue("white", "gray.800");
    const color = useColorModeValue("black", "white");
    //const borderColor = useColorModeValue("black", "white");
    const navigate = useNavigate();
    const filterValue = useColorModeValue('none', 'invert(1)');
    return( 
        
        <Box className="App" bg={bg} minW="100vw" minH="100vh" color={color}> 
            <Flex
            h={16}
            p='4'
            >
            <Center>Algo cherry</Center>
            <Spacer />
            <Box>
                <Button onClick={toggleColorMode} bg={bg} color={color}>
                    {colorMode === 'light' ? <LuMoon /> : <LuSun />}
                </Button>
            </Box>
            </Flex>
                <h1>Horarios Guapos :v<br/><br/></h1>
            <Center>
            <HStack>
                <Card.Root maxW="sm" overflow="hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Hacedor"
                    />
                    <Card.Body gap="2">
                        <Card.Title>Hacedor de Horarios</Card.Title>
                        <Card.Description>
                        Te permite crear todas las combinaciones de horarios posibles
                        según las materias que quieras cursar
                        </Card.Description>
                    </Card.Body>
                    <Card.Footer gap="2" alignSelf={"center"}>
                        <Center>
                        <Button variant="solid" bg={color} onClick={() => navigate("/Hacedor")}>PRUEBALO</Button>
                        </Center>   
                    </Card.Footer>
                    </Card.Root>
                <Card.Root maxW="sm" overflow="hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1560732488-6b0df240254a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Servidor"
                    />
                    <Card.Body gap="2">
                        <Card.Title>Optimizador de Horarios</Card.Title>
                        <Card.Description>
                        Crea la mejor combinación personalizada de horarios
                        según tus preferencias (Semestre, Materias ya cursadas, etc)
                        </Card.Description>
                    </Card.Body>
                    <Card.Footer gap="2" alignSelf={"center"}>
                        <Center>
                        <Button variant="solid" bg={color} onClick={() => navigate("/Setup")}>PRUEBALO</Button>
                        </Center>   
                    </Card.Footer>
                    </Card.Root>
                     
            </HStack>
            </Center>
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
    )
}