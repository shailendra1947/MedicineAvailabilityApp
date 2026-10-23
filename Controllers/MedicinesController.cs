using Microsoft.AspNetCore.Mvc;
using MedicineAvailabilityApp.Data;
using MedicineAvailabilityApp.Models;

namespace MedicineAvailabilityApp.Controllers;

[ApiController]
[Route("api/medicines")]
public class MedicinesController : ControllerBase
{
    private readonly JsonStore _store;

    public MedicinesController(JsonStore store)
    {
        _store = store;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Medicine>>> GetAll([FromQuery] string? search, CancellationToken ct)
    {
        var medicines = await _store.GetMedicinesAsync(ct);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            medicines = medicines
                .Where(m => m.FullName.Contains(term, StringComparison.OrdinalIgnoreCase)
                            || m.Brand.Contains(term, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        return Ok(medicines.OrderBy(m => m.FullName));
    }

    [HttpPost]
    public async Task<ActionResult<Medicine>> Create([FromBody] MedicineRequest request, CancellationToken ct)
    {
        var medicine = new Medicine
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Notes = request.Notes?.Trim() ?? string.Empty,
            ExpiryDate = request.ExpiryDate,
            Quantity = request.Quantity,
            Price = Math.Round(request.Price, 2, MidpointRounding.AwayFromZero),
            Brand = request.Brand.Trim()
        };

        await _store.AddMedicineAsync(medicine, ct);
        return CreatedAtAction(nameof(GetAll), new { id = medicine.Id }, medicine);
    }
}
