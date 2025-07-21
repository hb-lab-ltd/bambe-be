const prisma = require('../prismaClient');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminProducts = async (req, res) => {
  const user_id = req.user?.id;
  try {
    const products = await prisma.product.findMany({
      where: { user_id },
      include: { images: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retrieve a product and its images
exports.getProductWithImages = async (req, res) => {
  const { productId } = req.params;

  try {
    // Query to get product and its images
    const product = await prisma.product.findUnique({ where: { id: Number(productId) }, include: { images: true } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Format the result to group images under the product
    const productWithImages = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      is_new: product.is_new,
      is_best_seller: product.is_best_seller,
      is_on_promotion: product.is_on_promotion,
      created_at: product.created_at,
      images: product.images
        .map(image => ({
          id: image.id,
          url: image.image_url,
          is_primary: image.is_primary,
        })),
    };

    res.json(productWithImages);
  } catch (err) {
    console.error('Error retrieving product with images:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Retrieve all products with their images
exports.getAllProductsWithImages = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { images: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retrieve all products with their images in a specific category
exports.getAllProductsWithSpecificCategory = async (req, res) => {
  const { category_id } = req.params;
  try {
    const products = await prisma.product.findMany({
      where: { category_id: Number(category_id) },
      include: { images: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(400).json({ message: 'User ID is missing from token' });
  }
  const { name, description, price, category_id, is_new, is_best_seller, is_on_promotion } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        user_id,
        name,
        description,
        price,
        category_id: category_id || null,
        is_new: is_new || false,
        is_best_seller: is_best_seller || false,
        is_on_promotion: is_on_promotion || false
      }
    });
    res.json({ id: product.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) }, include: { images: true } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { user_id, name, description, price, category_id, is_new, is_best_seller, is_on_promotion } = req.body;
  try {
    await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        user_id,
        name,
        description,
        price,
        category_id: category_id || null,
        is_new: is_new || false,
        is_best_seller: is_best_seller || false,
        is_on_promotion: is_on_promotion || false
      }
    });
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
