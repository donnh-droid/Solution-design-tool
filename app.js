document.addEventListener('DOMContentLoaded', function() {
    mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', generateSolution);

    function generateSolution() {
        const customerName = document.getElementById('customerName').value || "Khách hàng B2B";
        const productType = document.getElementById('productType').value;
        const pickup = document.getElementById('pickup').value || "DC Win Phúc Thọ (Thanh Ba)";
        const delivery = document.getElementById('delivery').value || "Chuỗi Cửa Hàng Phú Thọ";
        const slaVal = parseInt(document.getElementById('sla').value, 10);
        const sla = isNaN(slaVal) ? 24 : slaVal;
        const volumeVal = parseFloat(document.getElementById('volume').value);
        const volume = isNaN(volumeVal) ? 5 : volumeVal;

        // Function to strip dangerous characters for Mermaid
        const escapeMermaid = (str) => String(str).replace(/["><\]\[\\-]/g, '').trim();
        const safePickupMermaid = escapeMermaid(pickup);
        const safeDeliveryMermaid = escapeMermaid(delivery);

        let modelType = "";
        let solutionText = "";
        let mermaidCode = "";
        let tags = [];

        // Known Partners Database (Simulated)
        const knownPartners = {
            "winmart": {
                stores: ["WinMart+ Việt Trì", "WinMart+ Lâm Thao", "WinMart+ Phù Ninh", "WinMart Phú Thọ", "WinMart+ Đoan Hùng"],
                strategy: "Hybrid LTL & Dedicated Milk-run (Mô hình Trục - Nan hoa)",
                advice: "Với DC tại Thanh Ba (Phía Bắc), sản lượng 8 tấn/ngày sẽ được chia 4 Zone. Zone 1 (Lân cận) giao trực tiếp từ DC, Zone 2 (Trung tâm) trung chuyển qua Hub Việt Trì để phủ toàn tỉnh trong 24h."
            },
            "bach hoa xanh": {
                stores: ["BHX Tân Bình", "BHX Gò Vấp", "BHX Quận 12", "BHX Hóc Môn"],
                strategy: "Cross-docking tại Hub",
                advice: "Đưa hàng về Mega Hub Xuyên Á, sau đó xả hàng theo xe tải Last-mile của GHN để phủ nhanh 100% cửa hàng."
            }
        };

        const partnerKey = customerName.toLowerCase();
        const partnerData = knownPartners[partnerKey] || null;

        // Product specific advice
        const productAdvice = {
            fmcg: "Ưu tiên tối ưu chi phí và tần suất giao hàng ổn định.",
            perishable: "Yêu cầu khắt khe về thời gian (Leadtime < 6h) và xe tải có thiết bị giữ nhiệt.",
            electronics: "Hàng giá trị cao, cần quy trình bàn giao có seal và bảo hiểm 100%.",
            fashion: "Hàng cồng kềnh, ưu tiên xe thùng kín và hệ thống phân loại theo SKU/Size."
        };

        // Escape user input for safe HTML embedding
        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };
        const safeCustomerName = escapeHtml(customerName);
        const safePickup = escapeHtml(pickup);
        const safeDelivery = escapeHtml(delivery);

        if (partnerData) {
            modelType = `Giải Pháp Chiến Lược cho ${customerName}`;
            solutionText = `
                <div class="partner-alert">
                    <strong>Hệ thống nhận diện Đối tác chiến lược:</strong> Đã tìm thấy cấu trúc mạng lưới của ${safeCustomerName}.
                </div>
                <p><strong>Chiến lược đề xuất:</strong> ${partnerData.strategy}</p>
                <p>${partnerData.advice}</p>
                <div class="route-box">
                    <strong>Danh sách điểm giao trong Tuyến tối ưu (Sample Cluster):</strong>
                    <ul>
                        ${partnerData.stores.map(s => `<li>📍 ${s}</li>`).join('')}
                    </ul>
                </div>
                <p><strong>Tối ưu GHN:</strong> Tận dụng hệ thống gom đơn (Pooling) của GHN để kết hợp hàng B2B với các đơn hàng B2C nhỏ lẻ tại khu vực, giúp giảm cước vận chuyển trên mỗi điểm giao xuống 15%.</p>
                <div style="margin-top: 15px;">
                    <a href="winmart-solution.html" class="primary-btn" style="display: inline-block; text-align: center; text-decoration: none; padding: 10px 20px; font-size: 0.95rem;">Xem Báo Cáo Chi Tiết (Bản In)</a>
                </div>
            `;
            mermaidCode = `
                graph LR
                DC["${safePickupMermaid}"] -- "Milk Run Route" --> S1["${escapeMermaid(partnerData.stores[0])}"]
                S1 --> S2["${escapeMermaid(partnerData.stores[1])}"]
                S2 --> S3["${escapeMermaid(partnerData.stores[2])}"]
                S3 --> S4["..."]
                style DC fill:#f9f,stroke:#333
                classDef store fill:#fff,stroke:#F26522,stroke-width:2px;
                class S1,S2,S3,S4 store;
            `;
            tags = ["Milk Run Optimization", "Smart Clustering", "Cost-per-drop Reduction"];
        } else if (volume >= 3) {
            modelType = `LTL cho ${customerName}`;
            solutionText = `
                <p><strong>Phân tích cho ${safeCustomerName}:</strong> Với ngành hàng ${productType.toUpperCase()}, ${productAdvice[productType]}</p>
                <p>Chúng tôi sẽ kết hợp hàng hóa của bạn vào luồng vận tải trục của GHN.</p>
                <ul>
                    <li><strong>Mô hình:</strong> Hàng được gom tại các Bưu cục (Post Office) gần nhất hoặc lấy tại kho và đưa về Mega Hub.</li>
                    <li><strong>Tối ưu GHN:</strong> Sử dụng hệ thống phân loại tự động tại Hub (Xuyên Á/Long An) để chia chọn hàng theo tuyến siêu thị, giảm sai sót thủ công.</li>
                    <li><strong>Chi phí:</strong> Chia sẻ chi phí vận chuyển trục (Linehaul) với hàng TMĐT, giúp giá cước cực kỳ cạnh tranh.</li>
                </ul>
            `;
            mermaidCode = `
                graph TD
                P["${safePickupMermaid}"] --> H1["GHN Mega Hub (Gom hàng)"]
                H1 -- "Linehaul (Trục chính)" --> H2["GHN Hub (Phân phối)"]
                H2 --> D["${safeDeliveryMermaid}"]
                style H1 fill:#F26522,color:#fff
                style H2 fill:#F26522,color:#fff
            `;
            tags = ["Cross-docking", "Linehaul Sharing", "Auto-Sorting"];
        }

        // Update UI with DOMPurify (fail closed if unavailable)
        document.getElementById('modelType').innerText = modelType;
        const cleanSolutionText = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(solutionText) : '';
        document.getElementById('solutionContent').innerHTML = cleanSolutionText;
        
        const tagsContainer = document.getElementById('tags');
        const cleanTags = tags.map(t => `<span class="tag highlight">${typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(t) : escapeHtml(t)}</span>`).join('');
        tagsContainer.innerHTML = cleanTags;

        // Update Mermaid
        const mermaidDiv = document.getElementById('mermaidDiagram');
        mermaidDiv.removeAttribute('data-processed');
        mermaidDiv.innerHTML = mermaidCode;
        mermaid.contentLoaded();
    }
});
