const express = require("express");
const path = require("path");
const router = express.Router();
const actions = require("../methods/actions");
const method = actions.functions;
const upload = actions.upload;
const up = actions.uploadDumm;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

//for demo
router.get("/", async (req, res) => {
  // res.sendFile(path.join(__dirname+'/resetPassword.html'))
  // await fetch(
  //   "https://zoho-invoice-server.herokuapp.com/api/authenticate-user",
  //   {
  //     method: "GET",
  //   }
  // )
  //   .then((result) => result.json())
  //   .then((result) => {
  //     console.log(result);
  //   });
  // res.cookie("accessToken", "hegsdsjduwuewkn273u2e", {
  //   domain: "https://zoho-invoice-clone.vercel.app/",

  //   httpOnly: false,
  //   signed: true,
  //   expires: new Date(new Date().getTime() + 500 * 1000),
  // });
  res.send("Welcome to Trade GO !");
});

//@desc Adding new user
//@route POST /adduser
router.post("/register", method.SignUp);

//@desc Authenticate a user
//@route POST /authenticate
router.post("/login", method.SignIn);

//@desc Request a token to update user password
//@route POST/request-reset-password-link
router.post("/request-reset-password-link", method.requestPasswordMail);

//@desc Find a user and update his password
//@route PATCH/reset-password
router.patch("/reset-password", method.resetPassword);

//@desc Get info on a user
//@route GET /getinfo
router.get("/getinfo", method.getinfo);

//@desc Upload Product images and details to the server of a single user with user_id.
//@route POST/upload-products
router.post(
  "/upload-products",
  upload.array("p_image"),
  method.uploadProductDetails
);

//@desc Retrieving user products from the server
//@route GET/get-user-products
router.post("/get-user-products", method.getUserProducts);

//@desc Retrieving all products from the server
//@route GET/get-all-products
router.post("/get-all-products", method.getAllProducts);

//@desc Find a product by its id and update its stock count
//@route PATCH/update-product-stock
router.patch("/update-product-stock", method.updateProduct_Stock);

//@desc Find a product by its id and delete it permanently
//@route DELETE/delete-product
router.delete("/delete-product", method.deleteProduct);

//@desc Add a product to cart on user's request.
//@route POST/add-to-cart
router.post("/add-to-cart", method.addTo_Cart);

//@desc Retrieve cart items of a user
//@route POST/retrieve-cart-products
router.post("/retrieve-cart-products", method.retrieveCartProducts);

//@desc Find a cart item by its id and delete it permanently
//@route DELETE/delete-cart-item
router.delete("/delete-cart-item", method.deleteCartProduct);

//@desc Select quantity and send otp to buy a product.
//@route POST/product-buy-sendOTP
router.post("/product-buy-sendOTP", method.productBuyInitiate);

//@desc Enter the OTP and confirm purchase.
//@route POST/product-buy-verifyOTP
router.post("/product-buy-verifyOTP", method.productBuyConfirm);

//@desc Retrieving user orders from the server .
//@route POST/get-user-orders
router.post("/get-user-orders", method.getUserOrders);

///--------------BELOW THESE ARE ONLY FOR DEMO . THESE ARE NOT IN THE PART OF FINAL VERSION----------------

//*@desc Upload Product images and details to the server of a single user with user_id.
//*@route POST/upload-products
router.post("/upload", up.single("hi"), method.uploadDummy);
router.get("/reset-password-new/:token", function (req, res) {
  res.send("You are in reset password page ", function (req, res) {});
});
router.post("/upload-word-file", upload.array("files"), function (req, res) {
  const files = req.files;
  var resFiles = [...files];
  files.map((file) => console.log(file));
  res.status(200).send({ msg: "Worked !", files: resFiles });
});

module.exports = router;
