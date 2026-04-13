<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use App\Models\Vendeur;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendeur_id' => Vendeur::factory(),
            'category_id' => Category::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 500, 25000),
            'stock' => fake()->numberBetween(0, 100),
            'weight' => fake()->randomFloat(2, 0.1, 3.0),
            'images' => [],
            'is_active' => true,
            'created_by' => User::factory(),
            'updated_by' => null,
        ];
    }
}
