const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { email, password } = JSON.parse(event.body);
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or password' }) };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .order('id', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
    }

    const user = data[0];
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, user: { id: user.id, email: user.email } }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
