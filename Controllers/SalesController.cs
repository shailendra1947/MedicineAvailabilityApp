using Microsoft.AspNetCore.Mvc;
using MedicineAvailabilityApp.Data;
using MedicineAvailabilityApp.Models;

namespace MedicineAvailabilityApp.Controllers;

[ApiController]
[Route("api/sales")]
public class SalesController : ControllerBase
{
    private readonly JsonStore _store;

    public SalesController(JsonStore store)
    {
        _store = store;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sale>>> GetAll(CancellationToken ct)
    {
        var sales = await _store.GetSalesAsync(ct);
        return Ok(sales.OrderByDescending(s => s.SoldAt));
    }

    [HttpPost]
    public async Task<ActionResult<Sale>> Create([FromBody] SaleRequest request, CancellationToken ct)
    {
        var (sale, error) = await _store.RecordSaleAsync(request, ct);
        if (error is not null)
        {
            return BadRequest(new { message = error });
        }

        return CreatedAtAction(nameof(GetAll), new { id = sale!.Id }, sale);
    }
}
