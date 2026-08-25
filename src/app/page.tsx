const mvp = [
  "Tài khoản chờ Admin kích hoạt",
  "Đăng nhập bằng SĐT + @ và mật khẩu",
  "Cây gia phả + phân quyền theo nhánh",
  "Thành viên đã mất + ngày giỗ",
  "Sự kiện dòng họ",
  "Audit log + soft delete",
];

export default function Home() {
  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">STARTER REPOSITORY</p>
        <h1>Gia phả dòng họ</h1>
        <p>
          Project khởi tạo cho Next.js + Supabase + Vercel. AI coding agent bắt đầu bằng
          <code> TASK_INDEX.md </code> rồi thực hiện task hiện tại.
        </p>
        <ul>{mvp.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </main>
  );
}
