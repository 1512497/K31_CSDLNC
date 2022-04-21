const deleteProduct = async (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const result = await fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf,
        },
    });
    // btn.closest('article').remove(); // remove the closest article (not supported by IE)
    const article = btn.closest('article');
    article.parentNode.removeChild(article);
};
