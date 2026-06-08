async function loadMyComplaints() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/complaints/my', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const complaints = await response.json();
        const container = document.getElementById('my-complaints-list');

        if (container) {
            if (complaints.length === 0) {
                container.innerHTML = '<p class="caption">You have not raised any complaints yet.</p>';
            } else {
                container.innerHTML = '';
                complaints.forEach(c => {
                    let statusClass = 'pending';
                    if (c.status === 'In Progress') statusClass = 'in-progress';
                    if (c.status === 'Completed') statusClass = 'completed';
                    if (c.status === 'Rejected') statusClass = 'rejected';

                    const date = new Date(c.created_at).toLocaleDateString();

                    const cardHTML = `
            <div class="md-card" style="margin-bottom: 24px; padding: 0; overflow: hidden; border: none; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); background: #fff; border-radius: 24px;">
              <div style="padding: 24px;">
                <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
                  ${c.image_url ? `
                    <div style="flex-shrink: 0;">
                      <img src="${c.image_url}" alt="Issue Photo" style="border-radius: 18px; width: 120px; height: 120px; object-fit: cover; border: 4px solid #f8fafc;">
                    </div>
                  ` : `
                    <div style="flex-shrink: 0; width: 120px; height: 120px; border-radius: 18px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
                      <span class="material-symbols-outlined" style="font-size: 40px;">image</span>
                    </div>
                  `}
                  <div style="flex-grow: 1; min-width: 280px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
                      <div>
                        <h4 style="margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 800; color: #1e293b;">${c.title}</h4>
                        <div style="display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.875rem;">
                          <span class="material-symbols-outlined" style="font-size: 16px;">category</span>
                          <span>${c.category}</span>
                          <span style="color: #cbd5e1;">•</span>
                          <span class="material-symbols-outlined" style="font-size: 16px;">location_on</span>
                          <span>${c.location}</span>
                        </div>
                      </div>
                      <div class="chip ${statusClass}" style="padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.02em;">${c.status.toUpperCase()}</div>
                    </div>
                    
                    <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9;">
                      <p style="margin: 0; color: #475569; font-size: 0.9375rem; line-height: 1.6;">${c.description}</p>
                    </div>

                    <div style="margin-top: 16px; display: flex; align-items: center; gap: 12px; color: #94a3b8; font-size: 0.8125rem;">
                       <div style="display: flex; align-items: center; gap: 4px;">
                         <span class="material-symbols-outlined" style="font-size: 16px;">calendar_month</span>
                         <span>Raised: ${date}</span>
                       </div>
                    </div>
                  </div>
                </div>

                ${c.completion_image_url ? `
                  <div style="margin-top: 24px; border-top: 2px dashed #e2e8f0; padding-top: 24px;">
                    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 20px; padding: 20px; border: 1px solid #dcfce7;">
                      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <div style="width: 32px; height: 32px; border-radius: 10px; background: #22c55e; color: #fff; display: flex; align-items: center; justify-content: center;">
                            <span class="material-symbols-outlined" style="font-size: 20px;">check_circle</span>
                          </div>
                          <div>
                            <p style="margin: 0; font-size: 0.9375rem; font-weight: 800; color: #166534;">RESOLUTION PROOF</p>
                            <p style="margin: 0; font-size: 0.75rem; color: #15803d; opacity: 0.8;">Action verified by Grampanchayat Officials</p>
                          </div>
                        </div>
                      </div>
                      
                      <div style="position: relative; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); background: #fff;">
                        <a href="${c.completion_image_url}" target="_blank" style="display: block; cursor: zoom-in;">
                          <img src="${c.completion_image_url}" style="width: 100%; max-height: 400px; object-fit: contain; background: #f8fafc; display: block;">
                          <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(15, 23, 42, 0.8); color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(4px);">
                            <span class="material-symbols-outlined" style="font-size: 16px;">zoom_in</span>
                            View Full Proof
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
                    container.innerHTML += cardHTML;
                });
            }
        }
    } catch (error) {
        console.error('Failed to load complaints', error);
    }
}