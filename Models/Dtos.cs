using System.ComponentModel.DataAnnotations;

namespace MedicineAvailabilityApp.Models;

public class MedicineRequest
{
    [Required, StringLength(200, MinimumLength = 1)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Notes { get; set; } = string.Empty;

    [Required]
    public DateOnly ExpiryDate { get; set; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, 999999.99)]
    public decimal Price { get; set; }

    [Required, StringLength(120, MinimumLength = 1)]
    public string Brand { get; set; } = string.Empty;
}

public class SaleRequest
{
    [Required]
    public Guid MedicineId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
