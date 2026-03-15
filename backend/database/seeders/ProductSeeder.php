<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Vendeur;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $vendeur1 = Vendeur::first();
        $vendeur2 = Vendeur::skip(1)->first();

        $arachidesNaturelles = Category::where('slug', 'arachides-naturelles')->first();
        $arachidesCaramel = Category::where('slug', 'arachides-caramelisees')->first();
        $confiseries = Category::where('slug', 'croquants')->first();
        $biscuits = Category::where('slug', 'biscuits')->first();

        $products = [

            [
                'vendeur_id' => $vendeur1->id,
                'category_id' => $arachidesNaturelles->id,
                'name' => 'Arachides Crues 500g',
                'description' => 'Arachides naturelles non grillées',
                'price' => 2000,
                'stock' => 100,
                'weight' => 0.5,
                'images' => ['products/arachides-crues.jpg'],
                'created_by' => $vendeur1->user_id,
            ],

            [
                'vendeur_id' => $vendeur1->id,
                'category_id' => $arachidesNaturelles->id,
                'name' => 'Arachides Grillées Salées 500g',
                'description' => 'Arachides grillées avec une touche de sel',
                'price' => 2500,
                'stock' => 80,
                'weight' => 0.5,
                'images' => ['products/arachides-grillees.jpg'],
                'created_by' => $vendeur1->user_id,
            ],

            [
                'vendeur_id' => $vendeur1->id,
                'category_id' => $arachidesCaramel->id,
                'name' => 'Arachides Caramélisées 250g',
                'description' => 'Arachides sucrées enrobées de caramel',
                'price' => 3000,
                'stock' => 60,
                'weight' => 0.25,
                'images' => ['products/arachides-caramel.jpg'],
                'created_by' => $vendeur1->user_id,
            ],

            [
                'vendeur_id' => $vendeur2->id,
                'category_id' => $confiseries->id,
                'name' => 'Croquants d’Arachide',
                'description' => 'Croquants traditionnels à base d’arachide',
                'price' => 1500,
                'stock' => 70,
                'weight' => 0.2,
                'images' => ['products/croquant-arachide.jpg'],
                'created_by' => $vendeur2->user_id,
            ],

            [
                'vendeur_id' => $vendeur2->id,
                'category_id' => $confiseries->id,
                'name' => 'Coco Caramélisé',
                'description' => 'Morceaux de coco enrobés de caramel',
                'price' => 2000,
                'stock' => 50,
                'weight' => 0.2,
                'images' => ['products/coco-caramel.jpg'],
                'created_by' => $vendeur2->user_id,
            ],

            [
                'vendeur_id' => $vendeur2->id,
                'category_id' => $biscuits->id,
                'name' => 'Biscuits Sablés Sénégalais',
                'description' => 'Biscuits sablés traditionnels faits maison',
                'price' => 2500,
                'stock' => 40,
                'weight' => 0.3,
                'images' => ['products/biscuits-sables.jpg'],
                'created_by' => $vendeur2->user_id,
            ],

        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
