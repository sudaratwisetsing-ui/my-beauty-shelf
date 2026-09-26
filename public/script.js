const productList = document.getElementById("productList");
const productForm = document.getElementById("productForm");

const totalProducts = document.getElementById("totalProducts");
const skincareCount = document.getElementById("skincareCount");
const makeupCount = document.getElementById("makeupCount");

const searchInput = document.getElementById("searchInput");

const editModal = document.getElementById("editModal");
const closeModal = document.getElementById("closeModal");
const editForm = document.getElementById("editForm");

let allProducts = [];
let currentCategory = "all";


// ========================================
// GET PRODUCTS
// ========================================

async function loadProducts() {

    try {

        let url = "/api/products";

        // Filter ด้วย Query String
        if (currentCategory !== "all") {
            url += `?category=${currentCategory}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("ไม่สามารถโหลดข้อมูลสินค้าได้");
        }

        allProducts = await response.json();

        displayProducts(allProducts);
        updateStatistics();

    } catch (error) {

        console.error(error);

        productList.innerHTML = `
            <div class="empty-message">
                <h3>เกิดข้อผิดพลาด ❌</h3>
                <p>ไม่สามารถเชื่อมต่อกับ API ได้</p>
            </div>
        `;
    }
}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts(products) {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const filteredProducts = products.filter(product => {

        const name =
            product.name.toLowerCase();

        const brand =
            product.brand.toLowerCase();

        return (
            name.includes(searchText) ||
            brand.includes(searchText)
        );
    });


    if (filteredProducts.length === 0) {

        productList.innerHTML = `
            <div class="empty-message">
                <h3>ยังไม่มีสินค้าที่ค้นพบ 🛍️</h3>
                <p>ลองเพิ่มสินค้าใหม่หรือเปลี่ยนคำค้นหา</p>
            </div>
        `;

        return;
    }


    productList.innerHTML =
        filteredProducts.map(product => {

            const icon =
                product.category === "skincare"
                    ? "🧴"
                    : "💄";

            const statusText =
                product.status === "using"
                    ? "กำลังใช้"
                    : "ยังไม่ได้ใช้";


            return `
                <div class="product-card">

                    <div class="product-icon">
                        ${icon}
                    </div>

                    <h3>${product.name}</h3>

                    <p class="product-brand">
                        ${product.brand}
                    </p>

                    <div class="product-info">

                        <span>
                            ประเภท: ${product.category}
                        </span>

                        <span>
                            ชนิด: ${product.type}
                        </span>

                        <span class="product-price">
                            ฿${Number(product.price).toLocaleString()}
                        </span>

                        <span>
                            สถานะ:
                            <span class="badge">
                                ${statusText}
                            </span>
                        </span>

                    </div>

                    <div class="product-actions">

                        <button
                            class="btn btn-edit"
                            onclick="openEditModal(${product.id})"
                        >
                            ✏️ แก้ไข
                        </button>

                        <button
                            class="btn btn-delete"
                            onclick="deleteProduct(${product.id})"
                        >
                            🗑️ ลบ
                        </button>

                    </div>

                </div>
            `;
        }).join("");
}


// ========================================
// UPDATE STATISTICS
// ========================================

async function updateStatistics() {

    try {

        const response =
            await fetch("/api/products");

        const products =
            await response.json();

        totalProducts.textContent =
            products.length;

        skincareCount.textContent =
            products.filter(
                product =>
                    product.category === "skincare"
            ).length;

        makeupCount.textContent =
            products.filter(
                product =>
                    product.category === "makeup"
            ).length;

    } catch (error) {

        console.error(error);

    }
}


// ========================================
// ADD PRODUCT - POST
// ========================================

productForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const product = {

            name:
                document.getElementById("name").value,

            brand:
                document.getElementById("brand").value,

            category:
                document.getElementById("category").value,

            type:
                document.getElementById("type").value,

            price:
                Number(
                    document.getElementById("price").value
                ),

            status:
                document.getElementById("status").value
        };


        try {

            const response = await fetch(
                "/api/products",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(product)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "ไม่สามารถเพิ่มสินค้าได้"
                );

                return;
            }


            alert("เพิ่มสินค้าเรียบร้อยแล้ว 💗");

            productForm.reset();

            loadProducts();

        } catch (error) {

            console.error(error);

            alert(
                "ไม่สามารถเชื่อมต่อกับ Server ได้"
            );
        }

    }
);


// ========================================
// OPEN EDIT MODAL
// ========================================

async function openEditModal(id) {

    try {

        const response =
            await fetch(`/api/products/${id}`);


        if (!response.ok) {

            alert("ไม่พบสินค้านี้");

            return;
        }


        const product =
            await response.json();


        document.getElementById("editId").value =
            product.id;

        document.getElementById("editName").value =
            product.name;

        document.getElementById("editBrand").value =
            product.brand;

        document.getElementById("editCategory").value =
            product.category;

        document.getElementById("editType").value =
            product.type;

        document.getElementById("editPrice").value =
            product.price;

        document.getElementById("editStatus").value =
            product.status;


        editModal.classList.add("show");

    } catch (error) {

        console.error(error);

        alert("ไม่สามารถโหลดข้อมูลสินค้าได้");
    }
}


// ========================================
// CLOSE EDIT MODAL
// ========================================

closeModal.addEventListener(
    "click",
    function() {

        editModal.classList.remove("show");

    }
);


// ปิด Modal เมื่อคลิกด้านนอก

editModal.addEventListener(
    "click",
    function(event) {

        if (event.target === editModal) {

            editModal.classList.remove("show");

        }

    }
);


// ========================================
// EDIT PRODUCT - PATCH
// ========================================

editForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const id =
            document.getElementById("editId").value;


        const updatedProduct = {

            name:
                document.getElementById("editName").value,

            brand:
                document.getElementById("editBrand").value,

            category:
                document.getElementById("editCategory").value,

            type:
                document.getElementById("editType").value,

            price:
                Number(
                    document.getElementById("editPrice").value
                ),

            status:
                document.getElementById("editStatus").value
        };


        try {

            const response = await fetch(
                `/api/products/${id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(updatedProduct)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "ไม่สามารถแก้ไขสินค้าได้"
                );

                return;
            }


            alert("แก้ไขสินค้าเรียบร้อยแล้ว ✨");

            editModal.classList.remove("show");

            loadProducts();

        } catch (error) {

            console.error(error);

            alert(
                "ไม่สามารถเชื่อมต่อกับ Server ได้"
            );
        }

    }
);


// ========================================
// DELETE PRODUCT - DELETE
// ========================================

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "ต้องการลบสินค้านี้ใช่หรือไม่?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/products/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const data =
                await response.json();

            alert(
                data.message ||
                "ไม่สามารถลบสินค้าได้"
            );

            return;
        }


        alert("ลบสินค้าเรียบร้อยแล้ว 🗑️");

        loadProducts();

    } catch (error) {

        console.error(error);

        alert(
            "ไม่สามารถเชื่อมต่อกับ Server ได้"
        );
    }
}


// ========================================
// FILTER CATEGORY
// ========================================

const filterButtons =
    document.querySelectorAll(".filter-btn");


filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        function() {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            currentCategory =
                this.dataset.category;

            loadProducts();

        }
    );

});


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    function() {

        displayProducts(allProducts);

    }
);


// ========================================
// START
// ========================================

loadProducts();