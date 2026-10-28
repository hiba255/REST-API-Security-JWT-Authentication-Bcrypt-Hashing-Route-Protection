
const Article = require('../models/articleModel');

// GET /api/articles - Get all articles
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate(
      'author',
      'name email role'
    );

    return res.status(200).json({
      total: articles.length,
      articles
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// GET /api/articles/my-articles - Get connected user's articles
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({
      author: req.user._id
    }).populate('author', 'name email role');

    return res.status(200).json({
      total: articles.length,
      articles
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// GET /api/articles/:id - Get one article
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      'author',
      'name email role'
    );

    if (!article) {
      return res.status(404).json({
        message: 'Article non trouvé'
      });
    }

    return res.status(200).json(article);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant invalide'
      });
    }

    return res.status(500).json({
      message: err.message
    });
  }
};

// POST /api/articles - Create an article (JWT required)
const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: 'Titre et contenu obligatoires'
      });
    }

    const newArticle = await Article.create({
      title,
      content,
      author: req.user._id
    });

    const populated = await newArticle.populate(
      'author',
      'name email role'
    );

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// PUT /api/articles/:id - Update an article (author or admin)
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: 'Article non trouvé'
      });
    }

    if (
      article.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: "Action interdite : vous n'êtes pas l'auteur de cet article"
      });
    }

    article.title = req.body.title ?? article.title;
    article.content = req.body.content ?? article.content;

    const updated = await article.save();

    const populated = await updated.populate(
      'author',
      'name email role'
    );

    return res.status(200).json(populated);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant invalide'
      });
    }

    return res.status(500).json({
      message: err.message
    });
  }
};

// DELETE /api/articles/:id - Delete an article (author or admin)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: 'Article non trouvé'
      });
    }

    if (
      article.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: "Action interdite : vous n'êtes pas l'auteur de cet article"
      });
    }

    await Article.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: 'Article supprimé avec succès',
      id: req.params.id
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant invalide'
      });
    }

    return res.status(500).json({
      message: err.message
    });
  }
};

// Export all controller functions
module.exports = {
  getAllArticles,
  getMyArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
