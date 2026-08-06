
const { getAdminClient, requireAdmin } = require("./_db");

module.exports = async function handler(req, res) {
  try {
    requireAdmin(req);
    const supabase = getAdminClient();

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return res.status(200).json({ bookings: data || [] });
    }

    if (req.method === "PATCH") {
      const { id, status } = req.body || {};
      const allowed = ["New", "Confirmed", "Completed", "Cancelled"];
      if (!id || !allowed.includes(status)) {
        return res.status(400).json({ error: "Invalid booking update" });
      }

      const { data, error } = await supabase
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return res.status(200).json({ booking: data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || "Request failed" });
  }
};
