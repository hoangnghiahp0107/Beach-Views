function getElement(selector) {
  return document.querySelector(selector);
}
document.addEventListener("DOMContentLoaded", function () {
  getComment();
});


async function getComment() {
  try {
    const response = await apiGetComment();
    const comments = response.map((comment) =>  new Comment(
        comment.binh_luan_id,
        comment.nguoi_dung_id,
        comment.bao_id,
        comment.ngay_binh_luan,
        comment.noi_dung
      ));
    renderComments(comments);
  } catch (error) {
    console.log("Lỗi từ máy chủ");
  }
}

async function taoComment() {
  if (!validate()) {
    return; 
  }
  const comments = {
    nguoi_dung_id: getElement("#nguoi_dung_id").value,
    bao_id: getElement("#bao_id").value,
    ngay_binh_luan: getElement("#ngay_binh_luan").value,
    noi_dung: getElement("#noi_dung").value
  };

  const willCreate = await Swal.fire({
    title: "Bạn có muốn thêm bình luận?",
    text: "Nhấn OK để xác nhận thêm bình luận.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Hủy",
  });

  if (willCreate.isConfirmed) {
    try {
      await apiCreateComment(comments);
      Swal.fire('Thêm bình luận thành công', '', 'success').then(() => {
        location.reload();
      });
    } catch (error) {
      Swal.fire('Thêm bình luận thất bại', '', 'error');
    }
  }
}

async function selectComment(commentID) {
  try {
    const response = await apiGetCommentID(commentID);
    const comment = response.data;
    getElement("#nguoi_dung_id").value = comment.nguoi_dung_id;
    getElement("#bao_id").value = comment.bao_id;
    getElement("#ngay_binh_luan").value = new Date(comment.ngay_binh_luan).toISOString().slice(0, 16);
    getElement("#noi_dung").value = comment.noi_dung;

    getElement(".modal-footer").innerHTML = `
          <button class="btn btn-success" onclick="updateComment('${comment.binh_luan_id}')">Cập nhật</button>
          <button id="btnDong" type="button" class="btn btn-danger" data-dismiss="modal">Đóng</button>
        `;
    $("#myModal").modal("show");

  } catch (error) {
    alert("Lấy thông tin bình luận thất bại");
  }
}

async function updateComment(commentID) {
  if (!validate()) {
    return; 
  }
  const ngay_binh_luan = new Date(getElement("#ngay_binh_luan").value + "Z").toISOString();
  const comment = {
    nguoi_dung_id: getElement("#nguoi_dung_id").value,
    bao_id: getElement("#bao_id").value,
    ngay_binh_luan,
    noi_dung: getElement("#noi_dung").value,
  };

  const willUpdate = await Swal.fire({
    title: "Bạn có muốn cập nhật bình luận?",
    text: "Nhấn OK để xác nhận cập nhật.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Hủy",
  });

  if (willUpdate.isConfirmed) {
    try {
      await apiUpdateComment(commentID, comment);
      Swal.fire('Cập nhật bình luận thành công', '', 'success').then(() => {
        location.reload();
      });
    } catch (error) {
      Swal.fire('Cập nhật bình luận thất bại', '', 'error');
    }
  }
}

async function deleteComment(commentID) {
  const willDelete = await Swal.fire({
    title: "Bạn có muốn xóa bình luận?",
    text: "Nhấn OK để xác nhận xóa bình luận.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Hủy",
  });

  if (willDelete.isConfirmed) {
    try {
      await apiDeleteComment(commentID);
      Swal.fire('Xóa bình luận thành công', '', 'success').then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire('Xóa bình luận thất bại', '', 'error');
    }
  }
}

function renderComments(comments) {
  const html = comments.reduce((result, comment) => {
    return (
      result +
      `
            <tr>
              <td>${comment.binh_luan_id}</td>
              <td>${comment.nguoi_dung_id}</td>
              <td>${comment.bao_id}</td>
              <td>${comment.ngay_binh_luan}</td>
              <td>${comment.noi_dung}</td>
              <td style="display: flex">
                <button class="btn btn-primary mx-2" onclick="selectComment('${comment.binh_luan_id}'); resetTB();">Xem</button>
                <button class="btn btn-danger" onclick="deleteComment('${comment.binh_luan_id}')">Xoá</button>
              </td>
            </tr>
          `
    );
  }, "");

  document.getElementById("tblDanhSachSP").innerHTML = html;
}

function clearModalInputs() {
  document.getElementById("nguoi_dung_id").value = "";
  document.getElementById("bao_id").value = "";
  document.getElementById("ngay_binh_luan").value = "";
  document.getElementById("noi_dung").value = "";


  document.getElementById("tbAccount").textContent = "";
  document.getElementById("tbNews").textContent = "";
  document.getElementById("tbNgayBinhLuan").textContent = "";
  document.getElementById("tbContent").textContent = "";
}

document.getElementById("btnThemSP").addEventListener("click", clearModalInputs);

function validate() {
  let isValid = true;

  let nguoi_dung_id = getElement("#nguoi_dung_id").value;
  if (!nguoi_dung_id.trim()) {
    isValid = false;
    getElement("#tbAccount").innerHTML = "Vui lòng nhập ID của người dùng!";
  } else {
    getElement("#tbAccount").innerHTML = "";
  }

  let bao_id = getElement("#bao_id").value;
  if (!bao_id.trim()) {
    isValid = false;
    getElement("#tbNews").innerHTML = "Vui lòng nhập ID của bài báo!";
  } else {
    getElement("#tbNews").innerHTML = "";
  }

  let ngay_binh_luan = getElement("#ngay_binh_luan").value;
  if (!ngay_binh_luan.trim()) {
    isValid = false;
    getElement("#tbNgayBinhLuan").innerHTML = "Vui lòng nhập ngày giờ bình luận!";
  } else {
    getElement("#tbNgayBinhLuan").innerHTML = "";
  }

  let noi_dung = getElement("#noi_dung").value;
  if (!noi_dung.trim()) {
    isValid = false;
    getElement("#tbContent").innerHTML = "Vui lòng nhập nội dung!";
  } else {
    getElement("#tbContent").innerHTML = "";
  }

  return isValid;
}

function resetTB(){
  getElement("#tbAccount").textContent = " ";
  getElement("#tbNews").textContent=" ";
  getElement("#tbNgayBinhLuan").textContent=" ";
  getElement("#tbContent").textContent=" ";
}

async function logout() {
  try {
    const token = localStorage.getItem("localStorageToken");

    await apiLogout(token);

    localStorage.removeItem("localStorageToken");

    Swal.fire('Đăng xuất thành công', '', 'success').then(() => {
      window.location.href = "index.html"; 
    });
  } catch (error) {
    Swal.fire('Lỗi khi đăng xuất', '', 'error');
    console.error(error);
  }
}