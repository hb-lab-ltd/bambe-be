const prisma = require('../prismaClient');

exports.searchListingsAndProducts = async (req, res) => {
  const { keyword } = req.query;
  try {
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { location: { contains: keyword, mode: 'insensitive' } }
        ]
      },
      include: { images: true },
      orderBy: { created_at: 'desc' }
    });
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } }
        ]
      },
      include: { images: true },
      orderBy: { created_at: 'desc' }
    });
    const results = [
      ...listings.map(l => ({ ...l, type: 'listing' })),
      ...products.map(p => ({ ...p, type: 'product' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (results.length === 0) {
      return res.status(404).json({ message: 'No results found' });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
