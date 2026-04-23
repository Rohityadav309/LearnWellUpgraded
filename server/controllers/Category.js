import Category from "../models/Category.js";

const getRandomInt = (max) => Math.floor(Math.random() * max);

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const categoryDetails = await Category.create({ name, description });

    return res.status(201).json({
      success: true,
      data: categoryDetails,
      message: "Category created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const showAllCategories = async (_req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true },
    ).lean();

    return res.status(200).json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: { path: "ratingAndReviews" },
      })
      .lean();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const selectedCourses = selectedCategory.courses || [];

    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .lean();

    const differentCategory = categoriesExceptSelected.length
      ? categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
      : null;

    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .lean();

    const mostSellingCourses = allCategories
      .flatMap((category) => category.courses || [])
      .sort(
        (a, b) =>
          (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0),
      )
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory: {
          ...selectedCategory,
          courses: selectedCourses,
        },
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
