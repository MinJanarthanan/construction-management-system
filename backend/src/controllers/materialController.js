const { Material, Project } = require('../models');
const { Op } = require('sequelize');

const LOW_STOCK_THRESHOLD = parseFloat(process.env.LOW_STOCK_THRESHOLD || '10');

const getAllMaterials = async (req, res) => {
  try {
    const { projectId, lowStockOnly, search } = req.query;
    const where = {};

    if (projectId) where.Project_ID = projectId;
    if (search) where.Material_Name = { [Op.like]: `%${search}%` };
    if (lowStockOnly === 'true') {
      where.Quantity = { [Op.lte]: LOW_STOCK_THRESHOLD };
    }

    const materials = await Material.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }
      ],
      order: [['Material_ID', 'DESC']]
    });

    const formatted = materials.map(m => {
      const mat = m.toJSON();
      mat.isLowStock = parseFloat(mat.Quantity) <= LOW_STOCK_THRESHOLD;
      return mat;
    });

    const lowStockCount = formatted.filter(m => m.isLowStock).length;
    const totalInventoryCost = formatted.reduce((sum, m) => sum + parseFloat(m.Total_Cost || 0), 0);

    return res.json({
      materials: formatted,
      lowStockCount,
      totalInventoryCost,
      lowStockThreshold: LOW_STOCK_THRESHOLD
    });
  } catch (err) {
    console.error('getAllMaterials error:', err);
    return res.status(500).json({ error: 'Failed to retrieve materials.' });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found.' });
    }

    const matJson = material.toJSON();
    matJson.isLowStock = parseFloat(matJson.Quantity) <= LOW_STOCK_THRESHOLD;

    return res.json({ material: matJson });
  } catch (err) {
    console.error('getMaterialById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve material.' });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { Project_ID, Material_Name, Quantity, Unit, Unit_Cost } = req.body;

    const project = await Project.findByPk(Project_ID);
    if (!project) {
      return res.status(400).json({ error: 'Referenced project does not exist.' });
    }

    const qty = parseFloat(Quantity) || 0;
    const cost = parseFloat(Unit_Cost) || 0;
    const totalCost = (qty * cost).toFixed(2);

    const material = await Material.create({
      Project_ID,
      Material_Name,
      Quantity: qty,
      Unit,
      Unit_Cost: cost,
      Total_Cost: totalCost
    });

    const populated = await Material.findByPk(material.Material_ID, {
      include: [{ model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }]
    });

    const matJson = populated.toJSON();
    matJson.isLowStock = parseFloat(matJson.Quantity) <= LOW_STOCK_THRESHOLD;

    return res.status(201).json({
      message: 'Material registered successfully',
      material: matJson
    });
  } catch (err) {
    console.error('createMaterial error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create material record.' });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found.' });
    }

    const { Material_Name, Quantity, Unit, Unit_Cost, Project_ID } = req.body;

    const newQty = Quantity !== undefined ? parseFloat(Quantity) : parseFloat(material.Quantity);
    const newCost = Unit_Cost !== undefined ? parseFloat(Unit_Cost) : parseFloat(material.Unit_Cost);
    const newTotal = (newQty * newCost).toFixed(2);

    await material.update({
      Material_Name: Material_Name !== undefined ? Material_Name : material.Material_Name,
      Quantity: newQty,
      Unit: Unit !== undefined ? Unit : material.Unit,
      Unit_Cost: newCost,
      Total_Cost: newTotal,
      Project_ID: Project_ID !== undefined ? Project_ID : material.Project_ID
    });

    const updated = await Material.findByPk(id, {
      include: [{ model: Project, as: 'project', attributes: ['Project_ID', 'Project_Name'] }]
    });

    const matJson = updated.toJSON();
    matJson.isLowStock = parseFloat(matJson.Quantity) <= LOW_STOCK_THRESHOLD;

    return res.json({
      message: 'Material updated successfully',
      material: matJson
    });
  } catch (err) {
    console.error('updateMaterial error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update material.' });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found.' });
    }

    await material.destroy();
    return res.json({ message: 'Material deleted successfully.' });
  } catch (err) {
    console.error('deleteMaterial error:', err);
    return res.status(500).json({ error: 'Failed to delete material.' });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
