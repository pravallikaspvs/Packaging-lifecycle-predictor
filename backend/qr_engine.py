import qrcode
import io
import base64

def generate_passport_qr_code(package_id: str, base_url: str = "http://localhost:5173") -> str:
    """
    Generates a valid scannable QR code directing to the package's Digital Passport.
    Returns a base64 Data URL (data:image/png;base64,...)
    """
    # Direct valid link to the passport route for this exact package
    passport_url = f"{base_url.rstrip('/')}/?view=passport&id={package_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(passport_url)
    qr.make(fit=True)

    # Use forest green fill to match the brand identity
    img = qr.make_image(fill_color="#14532D", back_color="#FFFFFF")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    return f"data:image/png;base64,{b64_str}"

if __name__ == "__main__":
    test_qr = generate_passport_qr_code("PKG-PET-8491")
    print("Generated QR length:", len(test_qr))
