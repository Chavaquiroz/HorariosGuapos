import { Box, Button, InputGroup, Input,  Spacer, Flex, Center } from "@chakra-ui/react"
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode"
import { LuLock, LuMoon, LuSun, LuUser } from "react-icons/lu"


export function Register() {

    const { colorMode, toggleColorMode } = useColorMode();
    const bg = useColorModeValue("white", "gray.800");
    const color = useColorModeValue("black", "white");
    const borderColor = useColorModeValue("black", "white");

    return( 
        
        <Box  className="App" bg={bg} minW="100vw" minH="100vh" color={color}>
            <Flex
            h={16}
            p='4'
            >
            <Center>Algo bien</Center>
            <Spacer />
            <Box>   
                <Button onClick={toggleColorMode} bg={bg} color={color}>
                    {colorMode === 'light' ? <LuMoon /> : <LuSun />}
                </Button>
            </Box>
            </Flex>
                <h1>Register<br/><br/></h1>
            
            
            
            <Box>
                <Spacer/>
                
                <form action="">
                    <InputGroup width={400} startElement={<LuUser />}>
                    
                        <Input placeholder="Username" />
                    </InputGroup>
                    <Spacer/>

                    <InputGroup width={400} startElement={<LuLock />}>
                        <Input placeholder="New Password" />
                    </InputGroup>
                    <Spacer/>
                    <InputGroup width={400} startElement={<LuLock />}>
                        <Input placeholder="Confirm Password" />
                    </InputGroup>
                    <Spacer/>
                    <br/><Button type="submit" bg={bg} color={color}  borderColor={borderColor}>Register</Button>
                    
                    <div className='register-link'>
                        <p><br/><br/>Already have an account? <a href="/#">Login</a></p>
                    </div>
                </form>
            </Box>
        </Box>
    )
}