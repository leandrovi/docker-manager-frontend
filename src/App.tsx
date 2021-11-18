import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  SimpleGrid,
  Container,
  Input,
  Button,
  Progress,
  Table,
  TableCaption,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
  Heading,
  Divider,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import { api } from "./api"

interface IPort {
  PrivatePort: number;
  Type: string;
}

interface IContainer {
  Id: string;
  Names: string[];
  Image: string;
  Ports: IPort[];
  State: string;
  Status: string;
}

interface IImage {
  Id: string;
  RepoTags: string[];
  RepoDigests: string[];
  Size: number;
}

export const App = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingTarget, setLoadingTarget] = React.useState("");

  const [containerName, setContainerName] = React.useState("");
  const [containerImage, setContainerImage] = React.useState("");
  const [containerPorts, setContainerPorts] = React.useState("");
  const [containers, setContainers] = React.useState<IContainer[]>([]);
  
  const [imageName, setImageName] = React.useState("");
  const [imageTag, setImageTag] = React.useState("");
  const [images, setImages] = React.useState<IImage[]>([]);
  
  React.useEffect(() => {
    async function fetchContainersList() {
      const { data } = await api.get("containers");
      setContainers(data);
    };

    async function fetchImagesList() {
      const { data } = await api.get("images");
      setImages(data);
    };

    fetchContainersList();
    fetchImagesList();
  }, []);

  async function handleContainerCreation() {
    setLoadingTarget("containerCreation");
    setIsLoading(true);

    const payload = {
      name: containerName,
      image: containerImage,
      port: containerPorts,
    };

    const { data } = await api.post("containers", payload);
    const { data: updatedContainers } = await api.get("containers");

    setContainers(updatedContainers);
    setIsLoading(false);
    setLoadingTarget("");
  }

  async function handleImageCreation() {
    setLoadingTarget("imageCreation");
    setIsLoading(true);

    const payload = {
      name: imageName,
      tag: imageTag,
    };

    const { data } = await api.post("images", payload);
    const { data: updatedImages } = await api.get("images");

    setContainers(updatedImages);
    setIsLoading(false);
    setLoadingTarget("");
  }

  async function handleDeleteContainer(id: string) {
    setLoadingTarget(id);
    setIsLoading(true);

    await api.delete(`containers/${id}`);

    setContainers((oldContainers) => ([
      ...oldContainers.filter(c => c.Id !== id)
    ]))

    setIsLoading(false);
    setLoadingTarget("");
  }

  async function handleDeleteImage(id: string) {
    setLoadingTarget(id);
    setIsLoading(true);

    await api.delete(`images/${id}`);

    setImages((oldImages) => ([
      ...oldImages.filter(c => c.Id !== id)
    ]))

    setIsLoading(false);
    setLoadingTarget("");
  }

  return (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl" paddingBottom="5%">
      {isLoading && (
        <Box pos="fixed" w="100%" zIndex={2}>
          <Progress size="md" isIndeterminate />
        </Box>
      )}

      <Grid minH="95vh" p={3}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <VStack spacing={8}>
          <Logo h="10vmin" pointerEvents="none" />
          <Text fontSize="5xl">
            Docker Manager
          </Text>

          <Divider />
          
          <Container maxW="container.lg">
            <Heading marginBottom="5%" marginTop="3%">Containers</Heading>

            <SimpleGrid columns={4} gap={6} marginBottom="5%">
              <Input
                value={containerName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContainerName(e.target.value)}
                placeholder="Nome do container"
              />
              <Input
                value={containerImage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContainerImage(e.target.value)}
                placeholder="Nome da imagem"
              />
              <Input
                value={containerPorts}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContainerPorts(e.target.value)}
                placeholder="Portas (ex: 80:80)"
              />
              <Button colorScheme="teal" onClick={handleContainerCreation} isLoading={isLoading && loadingTarget === "containerCreation"}>Criar</Button>
            </SimpleGrid>

            <Table variant="simple">              
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Imagem</Th>
                  <Th>Porta</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {containers.map(container => (
                  <Tr key={container.Id}>
                    <Td>
                      <Text maxWidth="120px" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden" lineHeight="1.4rem">
                        {container.Names[0]}
                      </Text>
                    </Td>
                    <Td>
                      <Text maxWidth="120px" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden" lineHeight="1.4rem">
                        {container.Image}
                      </Text>
                    </Td>
                    <Td>{`${container.Ports[0].PrivatePort}/${container.Ports[0].Type}`}</Td>
                    <Td>{container.Status}</Td>
                    <Td>
                      <Button colorScheme="red" onClick={() => handleDeleteContainer(container.Id)} isLoading={isLoading && loadingTarget === container.Id}>
                        Apagar
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Container>

          <Container maxW="container.lg">
            <Heading marginBottom="5%" marginTop="5%">Imagens</Heading>

            <SimpleGrid columns={3} gap={6} marginBottom="5%">
              <Input
                value={imageName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageName(e.target.value)}
                placeholder="Nome da imagem"
              />
              <Input
                value={imageTag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageTag(e.target.value)}
                placeholder="Tag da imagem"
              />
              <Button colorScheme="teal" onClick={handleImageCreation} isLoading={isLoading && loadingTarget === "imageCreation"}>Criar</Button>
            </SimpleGrid>

            <Table variant="simple">              
              <Thead>
                <Tr>
                  <Th>Tag</Th>
                  <Th>Digest</Th>
                  <Th>Tamanho</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {images.map(image => (
                  <Tr key={image.Id}>
                    <Td>
                      <Text maxWidth="160px" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden" lineHeight="1.4rem">
                        {(image.RepoTags && image.RepoTags[0]) ?? "(tag indisponível)"}
                      </Text>
                    </Td>
                    <Td>
                      <Text maxWidth="120px" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden" lineHeight="1.4rem">
                        {image.RepoDigests[0] ?? ""}
                      </Text>
                    </Td>
                    <Td>{image.Size}</Td>
                    <Td>
                      <Button colorScheme="red" onClick={() => handleDeleteImage(image.Id)} isLoading={isLoading && loadingTarget === image.Id}>
                        Apagar
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Container>
        </VStack>
      </Grid>
    </Box>
  </ChakraProvider>
);
}
