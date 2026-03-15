<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Vendeur;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
           // Admin
        $admin = User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+221774047668',
            'country' => 'Sénégal',
        ]);

        // Vendeur 1
        $vendeur1 = User::create([
            'name' => 'Khady Baldé',
            'email' => 'khady@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'vendeur',
            'phone' => '+22178 264 94 67',
            'address' => 'Médina, Dakar',
            'country' => 'Sénégal',
        ]);

        Vendeur::create([
            'user_id' => $vendeur1->id,
            'shop_name' => 'Terranga Foods',
            'description' => 'Produits locaux de qualité depuis 2020',
        ]);

        // Vendeur 2
        $vendeur2 = User::create([
            'name' => 'Moussa Sall',
            'email' => 'moussa@plateforme.sn',
            'password' => Hash::make('password'),
            'role' => 'vendeur',
            'phone' => '+221773456789',
            'address' => 'Plateau, Dakar',
            'country' => 'Sénégal',
        ]);

        Vendeur::create([
            'user_id' => $vendeur2->id,
            'shop_name' => 'Saveurs du Sahel',
            'description' => 'Spécialiste des fruits secs',
        ]);

        // Client
        User::create([
            'name' => 'Adama Ba',
            'email' => 'adama@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'phone' => '+22178 107 82 63',
            'address' => 'Paris, France',
            'country' => 'France',
        ]);
    }
}
