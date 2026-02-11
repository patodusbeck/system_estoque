import { connectDB, Coupon } from './_shared/db.js';

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase();
}

function parseDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCouponStatus(coupon) {
  const now = new Date();
  if (!coupon.active) return 'inativo';
  if (coupon.startsAt && now < coupon.startsAt) return 'agendado';
  if (coupon.expiresAt && now > coupon.expiresAt) return 'expirado';
  return 'ativo';
}

function serializeCoupon(coupon) {
  const obj = coupon.toObject ? coupon.toObject() : coupon;
  return {
    ...obj,
    status: getCouponStatus(obj),
  };
}

function validateCouponFields(payload, { creating = false } = {}) {
  const errors = [];
  const code = normalizeCode(payload.code);
  const discountPercent = Number(payload.discountPercent);
  const startsAt = parseDateOrNull(payload.startsAt) || new Date();
  const expiresAt = parseDateOrNull(payload.expiresAt);
  const active = payload.active === undefined ? true : Boolean(payload.active);

  if (creating && !code) {
    errors.push('Codigo do cupom e obrigatorio');
  }
  if ((creating || payload.discountPercent !== undefined) && (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100)) {
    errors.push('Percentual de desconto deve estar entre 1 e 100');
  }
  if (creating && !expiresAt) {
    errors.push('Data de validade e obrigatoria');
  }
  if (expiresAt && startsAt > expiresAt) {
    errors.push('Data inicial nao pode ser maior que validade');
  }

  return {
    errors,
    normalized: {
      code,
      discountPercent,
      startsAt,
      expiresAt,
      active,
    },
  };
}

async function validateCouponCode(code) {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) {
    return { valid: false, error: 'Informe um cupom' };
  }

  const coupon = await Coupon.findOne({ code: normalizedCode });
  if (!coupon) {
    return { valid: false, error: 'Cupom nao encontrado' };
  }

  const status = getCouponStatus(coupon);
  if (status !== 'ativo') {
    return { valid: false, error: `Cupom ${status}` };
  }

  return {
    valid: true,
    coupon: serializeCoupon(coupon),
  };
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    const { id, code, validate } = req.query;

    if (req.method === 'GET') {
      if (validate === 'true') {
        const validation = await validateCouponCode(code);
        if (!validation.valid) {
          return res.status(400).json(validation);
        }
        return res.status(200).json(validation);
      }

      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.status(200).json(coupons.map(serializeCoupon));
    }

    if (req.method === 'POST') {
      const { errors, normalized } = validateCouponFields(req.body || {}, { creating: true });
      if (errors.length) {
        return res.status(400).json({ error: errors[0], details: errors });
      }

      const exists = await Coupon.findOne({ code: normalized.code });
      if (exists) {
        return res.status(409).json({ error: 'Ja existe um cupom com esse codigo' });
      }

      const coupon = new Coupon(normalized);
      await coupon.save();
      return res.status(201).json(serializeCoupon(coupon));
    }

    if (req.method === 'PUT' && id) {
      const current = await Coupon.findById(id);
      if (!current) {
        return res.status(404).json({ error: 'Cupom nao encontrado' });
      }

      const { errors, normalized } = validateCouponFields(req.body || {}, { creating: false });
      if (errors.length) {
        return res.status(400).json({ error: errors[0], details: errors });
      }

      if (normalized.code && normalized.code !== current.code) {
        const duplicate = await Coupon.findOne({ code: normalized.code, _id: { $ne: id } });
        if (duplicate) {
          return res.status(409).json({ error: 'Ja existe um cupom com esse codigo' });
        }
      }

      current.code = normalized.code || current.code;
      if (Number.isFinite(normalized.discountPercent)) current.discountPercent = normalized.discountPercent;
      if (normalized.startsAt) current.startsAt = normalized.startsAt;
      if (normalized.expiresAt) current.expiresAt = normalized.expiresAt;
      current.active = normalized.active;
      await current.save();

      return res.status(200).json(serializeCoupon(current));
    }

    if (req.method === 'DELETE' && id) {
      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) {
        return res.status(404).json({ error: 'Cupom nao encontrado' });
      }
      return res.status(200).json({ message: 'Cupom removido' });
    }

    return res.status(405).json({ error: 'Metodo nao permitido' });
  } catch (error) {
    console.error('Erro em coupons:', error);
    return res.status(500).json({ error: error.message });
  }
};
