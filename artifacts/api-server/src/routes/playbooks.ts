import { Router } from "express";
import pool from "../lib/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/playbooks", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const { rows } = await pool.query(
      `SELECT id, title, industry, target_audience, main_product, created_at, updated_at
       FROM playbooks WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar playbooks" });
  }
});

router.get("/playbooks/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM playbooks WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Playbook não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar playbook" });
  }
});

router.post("/playbooks", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const { title, industry, targetAudience, mainProduct, macContext, playbookData } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO playbooks (user_id, title, industry, target_audience, main_product, mac_context, playbook_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, title || "Playbook sem título", industry, targetAudience, mainProduct, macContext, JSON.stringify(playbookData)]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar playbook" });
  }
});

router.put("/playbooks/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const { title, playbookData } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE playbooks SET title = COALESCE($1, title), playbook_data = COALESCE($2, playbook_data), updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [title, playbookData ? JSON.stringify(playbookData) : null, req.params.id, userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Playbook não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar playbook" });
  }
});

router.delete("/playbooks/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    await pool.query(
      `DELETE FROM playbooks WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir playbook" });
  }
});

export default router;
