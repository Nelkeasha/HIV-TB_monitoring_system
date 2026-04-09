import { Router } from "express";
import {
  addStock,
  getMyStock,
  updateStock,
  dispenseStock,
  deleteStock,
} from "../controllers/stock.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  addStockSchema,
  dispenseStockSchema,
} from "../validators/stock.validator";

const router = Router();

/**
 * @swagger
 * tags:
router.post(
  '/',
  authenticate,
  authorize('chw'),
  validate(addStockSchema),
  addStock,
);
 *   name: Stock
 *   description: CHW medication stock management
 */

/**
 * @swagger
 * /stock:
 *   post:
 *     summary: Add a new medication to stock
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
router.get('/', authenticate, authorize('chw', 'admin'), getMyStock);
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [medication_name, quantity, unit]
 *             properties:
 *               medication_name:
 *                 type: string
 *                 example: "TDF/3TC/EFV"
 *               quantity:
 *                 type: integer
 *                 example: 100
 *               unit:
 *                 type: string
 *                 example: "tablets"
 *               low_stock_threshold:
 *                 type: integer
 *                 example: 20
 *               expiry_date:
 *                 type: string
 *                 format: date
 *                 example: "2027-01-01"
 *     responses:
 *       201:
 *         description: Medication added to stock
 *       409:
 *         description: Medication already exists
 */

/**
 * @swagger
 * /stock:
 *   get:
 *     summary: Get all stock for logged in CHW with alerts
router.put('/:id', authenticate, authorize('chw'), updateStock);
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock list with low stock and expiry alerts
 */
router.get("/", authenticate, authorize("chw", "admin"), getMyStock);

/**
 * @swagger
 * /stock/{id}:
 *   put:
 *     summary: Update stock quantity or threshold
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
router.patch(
  '/:id/dispense',
  authenticate,
  authorize('chw'),
  validate(dispenseStockSchema),
  dispenseStock,
);
 *                 example: 150
 *               low_stock_threshold:
 *                 type: integer
 *                 example: 25
 *               expiry_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Stock updated
 *       404:
 *         description: Stock item not found
 */
router.put("/:id", authenticate, authorize("chw"), updateStock);

/**
 * @swagger
 * /stock/{id}/dispense:
 *   patch:
 *     summary: Dispense medication and reduce stock
 *     tags: [Stock]
router.delete('/:id', authenticate, authorize('chw', 'admin'), deleteStock);
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity_given]
 *             properties:
 *               quantity_given:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: Stock dispensed with remaining quantity
 *       400:
 *         description: Not enough stock available
 */

/**
 * @swagger
 * /stock/{id}:
 *   delete:
 *     summary: Delete a stock item
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Stock item deleted
 *       404:
 *         description: Stock item not found
 */
router.post(
  "/",
  authenticate,
  authorize("chw"),
  validate(addStockSchema),
  addStock,
);
router.patch(
  "/:id/dispense",
  authenticate,
  authorize("chw"),
  validate(dispenseStockSchema),
  dispenseStock,
);
router.delete("/:id", authenticate, authorize("chw", "admin"), deleteStock);

export default router;
