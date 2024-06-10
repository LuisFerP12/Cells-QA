const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getFatherDirectories = async (req, res) => {
    const { teamId } = req.params;
    try {
        
        const directories = await prisma.directories.findMany({
            where: {
                teamId: parseInt(teamId),
                directoryFather: null 
            }
        });

        if (directories.length === 0) {
            return res.status(404).json({ error: 'No se encontraron directorios padre para el equipo especificado' });
        }

        res.status(200).json(directories);
    } catch (error) {
        console.error('Error al obtener los directorios padre del equipo:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

const deleteDirectory = async (req, res) => {
  const { directoryId } = req.params;
  const id = parseInt(directoryId);

  try {
    // Intenta eliminar el directorio directamente
    await prisma.directories.delete({
      where: {
          directoryId: id,
      }
    });

    res.status(200).json({ message: 'Directorio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar directorio:', error);
    if (error.code === 'P2003') {
      return res.status(409).json({ error: 'No se puede eliminar el directorio porque tiene registros dependientes.' });
    }
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const addDirectory = async (req, res) => {
  const { directoryName, teamId, descripcion} = req.body;
  const currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'America/Belize',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const [month, day, year] = currentDate.split('/');
  const dateInLocalTimezone = new Date(`${year}-${month}-${day}T00:00:00-06:00`);
  const currentDate2 = new Date().toLocaleDateString('en-CA');
  try{
    const existingDirectory = await prisma.directories.findFirst({
      where: {
        directoryName: directoryName,
        teamId: parseInt(teamId)
      }
    });

    if (existingDirectory) {
      return res.status(409).json({ error: 'Ya existe un directorio con ese nombre.' });
    }
    const newDirectory = await prisma.directories.create({
      data: {
        directoryName,
        teams: { 
          connect: { teamId: parseInt(teamId) }
        },
        versions:1,
        directoryRoute: "/",
        dateCreated: dateInLocalTimezone,
        lastModified: currentDate2,
        descripcion: descripcion
      }
    });
    res.status(201).json({ directory: newDirectory});
  }
  catch (error) {
    console.error('Error al crear directorio', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = {
    getFatherDirectories,
    deleteDirectory,
    addDirectory
};
