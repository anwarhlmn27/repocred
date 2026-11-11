<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Prodi;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    /**
     * Menampilkan daftar pengguna sistem beserta data role dan program studi.
     *
     * @return Response
     */
    public function index(): Response
    {
        $users = User::with(['role', 'prodi'])
            ->latest()
            ->get();

        $roles = Role::with('criteriaAccess')
            ->orderBy('name')
            ->get();

        $prodis = Prodi::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'acronym']);

        return Inertia::render('Master/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'prodis' => $prodis,
        ]);
    }

    /**
     * Menyimpan data pengguna baru ke dalam basis data sesuai desain RBAC.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|uuid|exists:roles,id',
            'prodi_id' => 'nullable|uuid|exists:prodis,id',
        ], [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email sudah terdaftar.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'role_id.required' => 'Peran / Hak Akses (Role) wajib dipilih.',
            'role_id.exists' => 'Peran yang dipilih tidak ditemukan dalam sistem.',
            'prodi_id.exists' => 'Program Studi yang dipilih tidak valid.',
        ]);

        $selectedRole = Role::findOrFail($validated['role_id']);

        // Jika peran berskala prodi (misal: Kaprodi), program studi wajib ditentukan
        if ($selectedRole->isProdiScoped() && empty($validated['prodi_id'])) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['prodi_id' => 'Program Studi wajib dipilih untuk peran tingkat program studi (Kaprodi).']);
        }

        // Jika peran berskala institusi (misal: Admin LPM, BAAK, Finance, dll), kosongkan prodi_id
        if ($selectedRole->isInstitusiScoped()) {
            $validated['prodi_id'] = null;
        }

        // Sinkronisasi kolom string 'role' untuk backward compatibility
        $validated['role'] = $selectedRole->code;

        try {
            DB::transaction(function () use ($validated) {
                $validated['password'] = Hash::make($validated['password']);
                User::create($validated);
            });

            return redirect()->route('master.users.index')->with('success', 'Pengguna baru berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('Gagal menambahkan pengguna baru: ' . $e->getMessage(), [
                'exception' => $e,
                'email' => $validated['email'] ?? null,
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem saat menyimpan data pengguna. Silakan coba beberapa saat lagi.');
        }
    }

    /**
     * Memperbarui data pengguna yang ada sesuai desain RBAC.
     *
     * @param Request $request
     * @param User $user
     * @return RedirectResponse
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role_id' => 'required|uuid|exists:roles,id',
            'prodi_id' => 'nullable|uuid|exists:prodis,id',
            'password' => 'nullable|string|min:8',
        ], [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email sudah terdaftar.',
            'role_id.required' => 'Peran / Hak Akses (Role) wajib dipilih.',
            'role_id.exists' => 'Peran yang dipilih tidak ditemukan dalam sistem.',
            'prodi_id.exists' => 'Program Studi yang dipilih tidak valid.',
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
        ]);

        $newRole = Role::findOrFail($validated['role_id']);

        // Jika peran berskala prodi, prodi_id wajib diisi
        if ($newRole->isProdiScoped() && empty($validated['prodi_id'])) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['prodi_id' => 'Program Studi wajib dipilih untuk peran tingkat program studi (Kaprodi).']);
        }

        // Jika peran berskala institusi, kosongkan prodi_id
        if ($newRole->isInstitusiScoped()) {
            $validated['prodi_id'] = null;
        }

        // Pencegahan Lockout: Jangan izinkan mengubah role admin_lpm jika ia adalah admin LPM terakhir
        $isCurrentlyAdminLpm = ($user->role === 'admin_lpm' || ($user->roleRef && $user->roleRef->code === 'admin_lpm'));
        if ($isCurrentlyAdminLpm && $newRole->code !== 'admin_lpm') {
            $adminCount = User::where('role', 'admin_lpm')
                ->orWhereHas('roleRef', function ($q) {
                    $q->where('code', 'admin_lpm');
                })
                ->count();

            if ($adminCount <= 1) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Tidak dapat mengubah peran Administrator LPM terakhir demi keamanan sistem.');
            }
        }

        // Sinkronisasi kolom string 'role' untuk backward compatibility
        $validated['role'] = $newRole->code;

        try {
            DB::transaction(function () use ($user, $validated) {
                if (!empty($validated['password'])) {
                    $validated['password'] = Hash::make($validated['password']);
                } else {
                    unset($validated['password']);
                }

                $user->update($validated);
            });

            return redirect()->route('master.users.index')->with('success', 'Data pengguna berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('Gagal memperbarui pengguna: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem saat memperbarui data pengguna. Silakan coba beberapa saat lagi.');
        }
    }

    /**
     * Menghapus data pengguna dari sistem.
     *
     * @param User $user
     * @return RedirectResponse
     */
    public function destroy(User $user): RedirectResponse
    {
        // Pencegahan Self-Delete
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
        }

        // Pencegahan Lockout: Jangan izinkan menghapus admin_lpm terakhir
        $isAdminLpm = ($user->role === 'admin_lpm' || ($user->roleRef && $user->roleRef->code === 'admin_lpm'));
        if ($isAdminLpm) {
            $adminCount = User::where('role', 'admin_lpm')
                ->orWhereHas('roleRef', function ($q) {
                    $q->where('code', 'admin_lpm');
                })
                ->count();

            if ($adminCount <= 1) {
                return redirect()->back()->with('error', 'Tidak dapat menghapus Administrator LPM terakhir dalam sistem demi keamanan akses.');
            }
        }

        try {
            $userName = $user->name;

            DB::transaction(function () use ($user) {
                $user->delete();
            });

            return redirect()->route('master.users.index')->with('success', 'Pengguna "' . $userName . '" berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Gagal menghapus pengguna: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
            ]);

            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat menghapus data pengguna. Silakan coba beberapa saat lagi.');
        }
    }
}
