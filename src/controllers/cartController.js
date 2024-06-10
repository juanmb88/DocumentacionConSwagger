import CartManager from "../services/cartManager.js";
import ProductManager from "../services/productManager.js";
import { isValidObjectId } from "mongoose";//se usa en addProductToCart

const cartManager = new CartManager();
const productManager = new ProductManager();

export class CartController{

    static getAll = async (req, res) => {
        try {
          const response = await cartManager.getAllCarts();
          res.json(response);
        } catch (error) {
          console.log(error);
          res.send("Error al intentar crear el carrito");
        }
      }
    
    static getById = async (req, res) => {
        const { cid } = req.params;
        try {
          if (!isValidObjectId(cid)) {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ error: `Enter valid cid/pid` });
          }
      
          const carrito = await cartManager.getOneByPopulate({ _id: cid });
      
          if (!carrito) {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ error: `Non-existent cart: id ${cid}` });
          }
      
          res.setHeader("Content-Type", "application/json");
          return res.status(200).json({ carrito });
        } catch (error) {
          res.status(500).send("Error trying to get cart");
        }
      }

    static createNewCart = async (req, res) => {
        try {
          const response = await cartManager.createCart();
          res.json(response);
        } catch (error) {
          res.send("Error when trying to create cart");
        }
      }
    
    static addProductToCart = async( req,res ) => {

        let { cid, pid } = req.params

        if(!isValidObjectId(cid) || !isValidObjectId(pid)){
            res.setHeader('Content-Type','application/json')
            return res.status(400).json({error:`Ingrese cid / pid válidos`})
        }
      
        let carrito = await cartManager.getOneBy({_id:cid})
        if(!carrito){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Carrito inexistente: id ${cid}`})
        }
      
        let product = await productManager.getOneBy({_id:pid})
        if(!product){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No existe producto con id ${pid}`})
        }
      
        let indiceProducto = carrito.products.findIndex(p=>p.product==pid)
        if(indiceProducto === -1){
          carrito.products.push({
            product: pid, quantity:1
          })
        }else{
          carrito.products[indiceProducto].quantity++
        }
        
        console.log(carrito, " console de carrito")
        let resultado = await cartManager.update(cid, carrito)
        if(resultado.modifiedCount>0){
            res.setHeader('Content-Type','application/json');
            return res.status(200).json({payload:"Carrito actualizado, se agrego producto exitosamente"});
        }else{
            res.setHeader('Content-Type','application/json');
            return res.status(500).json(
                {
                    error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle:`No se pudo realizar la actualizacion`
                }
            )}
      
      }

    static deleteProductByCart = async (req, res) => {
        const { cid, pid } = req.params;
        // Verifica si los IDs son válidos
        if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({ error: `Ingrese cid / pid válidos` });
        }
        try {
          await cartManager.decreaseProductQuantity(cid, pid);
      
          res.json({
            payload: `Se redujo la cantidad del producto con ID: ${pid} en el carrito con ID: ${cid}`,
          });
        } catch (error) {
          return res.status(500).json({ error: `${error.message}` });
        }
      }
     
    static deleteCartById = async (req, res) => {
        let { cid } = req.params;
        if (!isValidObjectId(cid)) {
          return res.status(400).json({
            error: `Enter a valid MongoDB id`,
          });
        }
      
        if (!cid) {
          return res.status(300).json({ error: "Check unfilled fields" });
        }
      
        try {
          await cartManager.deleteCartById(cid);
          res.setHeader("Content-Type", "application/json");
          res.json({ payload: `Carrito con ID :${cid} fue eliminado con exito` });
          //console.log("Carrito eliminado");
        } catch (error) {
          return res.status(500).json({ error: `${error.message}` });
        }
      }  

    static updateProduct = async (req, res) => {
        const { cId, pId } = req.params;
        if (!isValidObjectId(cId) || !isValidObjectId(pId)) {
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({ error: `Ingrese cid / pid válidos` });
        }
      
        try {
          let carrito = await cartManager.getOneBy({ _id: cId });
          if (!carrito) {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ error: `Carrito inexistente: id ${cId}` });
          }
      
          let productIndex = carrito.products.findIndex((p) => p.product == pId);
          if (productIndex === -1) {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ error: `El producto con id ${pId} no está en el carrito` });
          }
      
          const { quantity } = req.body;
      
          if (quantity <= 0) {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ error: `La cantidad debe ser mayor que cero` });
          }
      
          carrito.products[productIndex].quantity = quantity;
      
          const resultado = await cartManager.update(cId, carrito);
          if (resultado.modifiedCount > 0) {
            res.setHeader("Content-Type", "application/json");
            return res.status(200).json({ payload: "Producto en el carrito actualizado" });
          } else {
            res.setHeader("Content-Type", "application/json");
            return res.status(500).json({
              error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
              detalle: `No se pudo realizar la actualizacion`,
            });
          }
        } catch (error) {
          return res.status(500).json({ error: `${error.message}` });
        }
      }  
}