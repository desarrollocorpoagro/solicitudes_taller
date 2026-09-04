import { Request, Response } from 'express';
import { CatalogoRepuesto, VwFlotaArticulos } from '../models';
import { ErpService } from '../services/erp.service';
import { logger } from '../utils/logger';

export class CatalogoController {
  /**
   * Obtiene el catálogo completo de repuestos y sincroniza con el ERP Profit Plus.
   * Incluye los campos nativos de Profit: codigo_subalmacen, sub_almacen, stock_act, etc.
   */
  static async getCatalogo(req: Request, res: Response) {
    try {
      let profitArticulos: any[] = [];
      try {
        profitArticulos = await VwFlotaArticulos.findAll({
          order: [['nombre_producto', 'ASC']],
        });
      } catch (e: any) {
        logger.warn(`[CatalogoController] No se pudo leer VwFlotaArticulos: ${e.message}`);
      }

      if (profitArticulos && profitArticulos.length > 0) {
        const mapped = profitArticulos.map((p) => {
          const raw = p.toJSON ? p.toJSON() : p;
          const subCod = String(raw.codigo_subalmacen || '').trim();
          const stock = Number(raw.stock_act || 0);
          return {
            id: raw.codigo_profit,
            cod: raw.codigo_profit,
            desc: raw.nombre_producto,
            stock: stock,
            stock_act: stock,
            codigo_subalmacen: subCod,
            sub_almacen: raw.sub_almacen || (subCod === '01' ? 'PRINCIPAL' : 'CENTRAL'),
            codigo_almacen: raw.codigo_almacen || '01',
            almacen: raw.almacen || 'PRINCIPAL',
            costo: Number(raw.costo || 0),
            unidad_medida: raw.unidad_medida || 'UND',
            categoria: raw.categoria || 'REPUESTOS',
          };
        });

        const erpStatus = await ErpService.syncInventoryFromProfit();
        return res.json({
          success: true,
          count: mapped.length,
          data: mapped,
          erpSync: erpStatus,
        });
      }

      const repuestos = await CatalogoRepuesto.findAll({ order: [['desc', 'ASC']] });
      const erpStatus = await ErpService.syncInventoryFromProfit();

      return res.json({
        success: true,
        count: repuestos.length,
        data: repuestos.map((r) => {
          const raw = r.toJSON ? r.toJSON() : r;
          return {
            ...raw,
            codigo_subalmacen: '01',
            sub_almacen: 'PRINCIPAL',
            stock_act: raw.stock,
          };
        }),
        erpSync: erpStatus,
      });
    } catch (error: any) {
      logger.error(`[CatalogoController] Error al obtener catálogo: ${error.message}`);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Obtiene un repuesto específico por su código.
   */
  static async getRepuestoByCod(req: Request, res: Response) {
    try {
      const { cod } = req.params;
      const repuesto = await CatalogoRepuesto.findOne({
        where: { cod: cod.toUpperCase().trim() },
      });

      if (!repuesto) {
        return res.status(404).json({ success: false, error: 'Repuesto no encontrado en catálogo.' });
      }

      return res.json({ success: true, data: repuesto });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Actualiza las existencias de un repuesto.
   */
  static async updateStock(req: Request, res: Response) {
    try {
      const { cod } = req.params;
      const { stock, costo } = req.body;

      const repuesto = await CatalogoRepuesto.findOne({ where: { cod: cod.toUpperCase().trim() } });
      if (!repuesto) return res.status(404).json({ success: false, error: 'Repuesto no encontrado.' });

      if (stock !== undefined) repuesto.stock = parseInt(stock, 10);
      if (costo !== undefined) repuesto.costo = parseFloat(costo);

      await repuesto.save();
      logger.info(`[CatalogoController] Stock de repuesto ${cod} actualizado a ${repuesto.stock}`);
      return res.json({ success: true, message: 'Stock actualizado exitosamente.', data: repuesto });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default CatalogoController;
