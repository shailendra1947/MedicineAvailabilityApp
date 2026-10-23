using System.Text.Json;
using MedicineAvailabilityApp.Models;

namespace MedicineAvailabilityApp.Data;

public class JsonStore
{
    private readonly string _medicinesPath;
    private readonly string _salesPath;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly JsonSerializerOptions _json = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public JsonStore(IWebHostEnvironment env)
    {
        var dataDir = Path.Combine(env.ContentRootPath, "Data");
        Directory.CreateDirectory(dataDir);
        _medicinesPath = Path.Combine(dataDir, "medicines.json");
        _salesPath = Path.Combine(dataDir, "sales.json");
        EnsureFile(_medicinesPath, "[]");
        EnsureFile(_salesPath, "[]");
    }

    public async Task<List<Medicine>> GetMedicinesAsync(CancellationToken ct = default)
    {
        await _lock.WaitAsync(ct);
        try
        {
            return await ReadAsync<List<Medicine>>(_medicinesPath, ct) ?? [];
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<List<Sale>> GetSalesAsync(CancellationToken ct = default)
    {
        await _lock.WaitAsync(ct);
        try
        {
            return await ReadAsync<List<Sale>>(_salesPath, ct) ?? [];
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Medicine> AddMedicineAsync(Medicine medicine, CancellationToken ct = default)
    {
        await _lock.WaitAsync(ct);
        try
        {
            var medicines = await ReadAsync<List<Medicine>>(_medicinesPath, ct) ?? [];
            medicines.Add(medicine);
            await WriteAsync(_medicinesPath, medicines, ct);
            return medicine;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<(Sale? Sale, string? Error)> RecordSaleAsync(SaleRequest request, CancellationToken ct = default)
    {
        await _lock.WaitAsync(ct);
        try
        {
            var medicines = await ReadAsync<List<Medicine>>(_medicinesPath, ct) ?? [];
            var medicine = medicines.FirstOrDefault(m => m.Id == request.MedicineId);
            if (medicine is null)
            {
                return (null, "Medicine not found.");
            }

            if (medicine.Quantity < request.Quantity)
            {
                return (null, $"Only {medicine.Quantity} unit(s) available in stock.");
            }

            medicine.Quantity -= request.Quantity;

            var sale = new Sale
            {
                Id = Guid.NewGuid(),
                MedicineId = medicine.Id,
                MedicineName = medicine.FullName,
                Brand = medicine.Brand,
                Quantity = request.Quantity,
                UnitPrice = medicine.Price,
                TotalAmount = Math.Round(medicine.Price * request.Quantity, 2, MidpointRounding.AwayFromZero),
                SoldAt = DateTime.UtcNow
            };

            var sales = await ReadAsync<List<Sale>>(_salesPath, ct) ?? [];
            sales.Insert(0, sale);

            await WriteAsync(_medicinesPath, medicines, ct);
            await WriteAsync(_salesPath, sales, ct);
            return (sale, null);
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<T?> ReadAsync<T>(string path, CancellationToken ct)
    {
        await using var stream = File.Open(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        return await JsonSerializer.DeserializeAsync<T>(stream, _json, ct);
    }

    private async Task WriteAsync<T>(string path, T value, CancellationToken ct)
    {
        await using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, value, _json, ct);
    }

    private static void EnsureFile(string path, string contents)
    {
        if (!File.Exists(path))
        {
            File.WriteAllText(path, contents);
        }
    }
}
