const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getSonDirectories = async (req, res) => {
    const { teamId } = req.params;
    const { directoryFather } = req.params;
    try {
        
        const directories = await prisma.directories.findMany({
            where: {
                teamId: parseInt(teamId),
                directoryFather: parseInt(directoryFather)
            }
        });

        const files = await prisma.files.findMany({
            where: {
                teamId: parseInt(teamId),
                directoryId: parseInt(directoryFather)
            }
        });

        if (directories.length && files.length === 0) {
            return res.status(404).json({ error: 'Esta vacio este Directorio' });
        }
        
        const result = [
            ...directories.map(directory => ({ ...directory, type: 'directory' })),
            ...files.map(file => ({ ...file, type: 'file' }))
        ];

        res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener los directorios padre del equipo:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

module.exports = {
    getSonDirectories
    
};
