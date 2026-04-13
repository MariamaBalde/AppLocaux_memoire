<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vendeur>
 */
class VendeurFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state([
                'role' => 'vendeur',
                'country' => 'SN',
                'statut' => 'actif',
            ]),
            'shop_name' => fake()->company(),
            'description' => fake()->optional()->sentence(),
            'verified' => true,
            'rating' => fake()->randomFloat(1, 3, 5),
            'total_sales' => fake()->numberBetween(0, 500),
        ];
    }
}
