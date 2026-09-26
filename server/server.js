const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// ========================================
// Middleware
// ========================================

app.use(express.json());

// เปิดไฟล์ HTML, CSS, JavaScript จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, "../public")));


// ========================================
// ข้อมูลสินค้าเริ่มต้น
// ========================================

const products = [
    {
        id: 1,
        name: "Hyaluronic Acid Serum",
        brand: "Example Brand",
        category: "skincare",
        type: "serum",
        price: 299,
        status: "using"
    },
    {
        id: 2,
        name: "Moisturizing Cream",
        brand: "Example Brand",
        category: "skincare",
        type: "moisturizer",
        price: 450,
        status: "using"
    },
    {
        id: 3,
        name: "Juicy Lasting Tint",
        brand: "Example Brand",
        category: "makeup",
        type: "lip",
        price: 329,
        status: "using"
    },
    {
        id: 4,
        name: "Liquid Blush",
        brand: "Example Brand",
        category: "makeup",
        type: "blush",
        price: 259,
        status: "unused"
    }
];


// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/index.html")
    );
});


// ========================================
// GET /api/products
// ดึงสินค้าทั้งหมด
// รองรับ Filter ด้วย ?category=
// ========================================

app.get("/api/products", (req, res) => {

    const { category } = req.query;

    if (category) {

        const filteredProducts = products.filter(
            product => product.category === category
        );

        return res.json(filteredProducts);
    }

    res.json(products);
});


// ========================================
// GET /api/products/:id
// ดึงสินค้าตาม ID
// ========================================

app.get("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const product = products.find(
        product => product.id === id
    );

    if (!product) {

        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
});


// ========================================
// POST /api/products
// เพิ่มสินค้าใหม่
// ========================================

app.post("/api/products", (req, res) => {

    const {
        name,
        brand,
        category,
        type,
        price,
        status
    } = req.body;


    // ตรวจสอบข้อมูลที่จำเป็น
    if (
        !name ||
        !brand ||
        !category ||
        !type ||
        price === undefined ||
        !status
    ) {

        return res.status(400).json({
            message:
                "Name, brand, category, type, price and status are required"
        });
    }


    // ตรวจสอบราคา
    if (
        isNaN(Number(price)) ||
        Number(price) < 0
    ) {

        return res.status(400).json({
            message:
                "Price must be a valid positive number"
        });
    }


    // สร้าง ID ใหม่
    const newId =
        products.length > 0
            ? Math.max(
                ...products.map(product => product.id)
            ) + 1
            : 1;


    const newProduct = {

        id: newId,

        name,

        brand,

        category,

        type,

        price: Number(price),

        status
    };


    products.push(newProduct);


    // 201 Created
    res.status(201).json(newProduct);
});


// ========================================
// PATCH /api/products/:id
// แก้ไขสินค้า
// ========================================

app.patch("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const product = products.find(
        product => product.id === id
    );


    // ไม่พบสินค้า
    if (!product) {

        return res.status(404).json({
            message: "Product not found"
        });
    }


    const {
        name,
        brand,
        category,
        type,
        price,
        status
    } = req.body;


    // อัปเดตเฉพาะข้อมูลที่ส่งมา

    if (name !== undefined) {
        product.name = name;
    }


    if (brand !== undefined) {
        product.brand = brand;
    }


    if (category !== undefined) {
        product.category = category;
    }


    if (type !== undefined) {
        product.type = type;
    }


    if (price !== undefined) {

        if (
            isNaN(Number(price)) ||
            Number(price) < 0
        ) {

            return res.status(400).json({
                message:
                    "Price must be a valid positive number"
            });
        }

        product.price = Number(price);
    }


    if (status !== undefined) {
        product.status = status;
    }


    res.json(product);
});


// ========================================
// DELETE /api/products/:id
// ลบสินค้า
// ========================================

app.delete("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = products.findIndex(
        product => product.id === id
    );


    // ไม่พบสินค้า
    if (index === -1) {

        return res.status(404).json({
            message: "Product not found"
        });
    }


    // ลบสินค้า
    products.splice(index, 1);


    // 204 No Content
    res.status(204).send();
});


// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});