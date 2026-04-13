import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string().min(8, 'Confirmation requise'),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().min(1, 'Pays requis'),
  role: z.enum(['client', 'vendeur']),
  shop_name: z.string().optional(),
  shop_description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.password_confirmation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password_confirmation'],
      message: 'Les mots de passe ne correspondent pas',
    });
  }

  if (data.role === 'vendeur' && !data.shop_name?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['shop_name'],
      message: 'Le nom de la boutique est obligatoire',
    });
  }
});

export const checkoutSchema = z.object({
  shipping_address: z.string().min(5, 'Adresse requise'),
  shipping_city: z.string().min(2, 'Ville requise'),
  shipping_country: z.string().min(2, 'Pays requis'),
  shipping_phone: z.string().min(6, 'Téléphone requis'),
  shipping_method: z.enum(['local', 'international', 'diaspora']),
  payment_method: z.string().min(1, 'Méthode de paiement requise'),
  notes: z.string().optional(),
});

export const vendorProductSchema = z.object({
  category_id: z.coerce.number().int().positive('Catégorie requise'),
  name: z.string().min(2, 'Nom requis'),
  description: z.string().min(10, 'Description trop courte'),
  price: z.coerce.number().positive('Prix invalide'),
  stock: z.coerce.number().int().min(0, 'Stock invalide'),
  weight: z.union([z.literal(''), z.coerce.number().min(0, 'Poids invalide')]).optional(),
  is_active: z.boolean().optional(),
});
