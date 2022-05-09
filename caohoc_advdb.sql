-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2022 at 04:14 PM
-- Server version: 10.4.20-MariaDB
-- PHP Version: 8.0.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `caohoc_advdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` bigint(20) NOT NULL,
  `title` varchar(256) NOT NULL,
  `brand` varchar(256) DEFAULT NULL,
  `color` varchar(64) DEFAULT NULL,
  `price` double NOT NULL,
  `discount` varchar(256) NOT NULL DEFAULT '0',
  `description` varchar(1024) NOT NULL,
  `imageUrl` varchar(256) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `rating` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `title`, `brand`, `color`, `price`, `discount`, `description`, `imageUrl`, `userId`, `rating`) VALUES
(5, 'Máy Sấy Khử Trùng Chén Bát HZ-B26PA', 'Hanze', 'xanh dương', 1355000, '0', 'Công suất: 280W\r\nĐiện áp:L 220V\r\nTrọng lương: 3.4kg\r\nDung tích: 26L', 'images/b8e3e68f-c526-4a7b-992a-06d560231dda.png', 1, 0),
(6, 'Bếp Hồng Ngoại Sunhouse SHD6011', 'Sunhouse', 'Đen', 510000, '0', '2000W\r\n220 - 240 V/50-60Hz', 'images/0389cb0e-2c44-4343-a926-19951a8e7d76.jpeg', 1, 0),
(7, 'Ấm Đun Siêu Tốc Inox 2 Lớp Sunhouse SHD1351', 'Sunhouse', 'Xanh lá nhạt', 215900, '20000', '1.8L\r\n1500W\r\n1.07 Kg', 'images/f81a8e09-1527-44df-ae27-3ac826bc7ba0.jpeg', 1, 0),
(8, 'Nồi Chiên Không Dầu Điện Tử Philips HD9270/90', 'Philips', 'Đen', 3380000, '50000', '6.2L\r\nCảm ứng\r\nNhựa, Khay: Phủ lớp men chống dính\r\n2000W\r\n403x315x307 mm\r\n5.5kg', 'images/76335fa5-883a-4be1-86cc-24fbc72b253e.jpeg', 1, 0),
(9, 'Máy lọc nước nóng lạnh Karofi KAD-D66', 'Karofi ', 'Đen', 9483000, '0', '500ml\r\n85 - 95 độ\r\n8 - 10 độ\r\n1 Lít\r\n2 Lít\r\n34kg', 'images/d6170c66-5eb3-4a6a-913e-2ce14dcbaa43.jpeg', 1, 0),
(10, 'Máy Xay Thịt 2 Lưỡi Kép', 'Nonostyle', 'Trắng', 399000, '0', '2L\r\nThuỷ tinh cường lực\r\n300W', 'images/94d9c068-590b-43d5-8f89-4a90936a5fd5.jpeg', 1, 0),
(11, 'Máy Hút Bụi Cầm Tay Không Dây Damas XC628', 'Damas', 'Xám', 439000, '0', 'Korea / China / Vietnam\r\nXC628\r\n120W\r\n500ml\r\n<70db\r\nCầm tay', 'images/46abf748-e992-4c44-80bd-3667d175b774.png', 1, 0),
(12, 'Máy Làm Sữa Hạt Đa Năng Bluestone SMB-7329', 'Bluestone', 'Trắng', 1429000, '0', '1.3 Lít\r\n1000W', 'images/14599c47-2a96-41db-9fda-84af35f4ddc8.jpeg', 1, 0),
(13, 'Máy làm sữa hạt đa năng Mishio MK160', 'Mishio', 'Đỏ', 1526000, '50000', 'Chất liệu: Thủy tinh, nhựa chịu nhiệt, thép không gỉ\r\nDung tích tối đa: 1750 ml\r\nNhiệt độ: 0-100 độ C\r\nĐiện áp: 220-240V / 50Hz\r\nTốc độ quay: 30.000 vòng/phút\r\nCông suất khuấy định mức: 1000W\r\nCông suất làm nóng định mức: 800W', 'images/d0529a74-e634-495f-a33f-1205acbc9aa1.jpeg', 1, 0),
(14, 'Máy Vắt Cam Lock&Lock EJJ231', 'Lock&Lock', 'Trắng', 219000, '0', 'Máy Vắt Cam Lock&Lock EJJ231 được làm bằng nhựa PP, ABS bền đẹp, chắc chắn. Chất liệu nhựa nhẹ, dễ vệ sinh sau khi sử dụng. Máy có công suất 40W cho khả năng hoạt động ổn định, êm ái và không tốn nhiều điện năng.', 'images/05829360-0aa3-41d8-95e0-65e40d1a8524.jpeg', 1, 0),
(15, 'Bàn Ủi Hơi Nước Nagakawa NAG1505', 'Nagakawa ', 'Xanh dương', 339000, '0', 'Tay cầm bằng nhựa cách nhiệt màu trắng, đế bàn là được phủ lớp chống dính teflon cao cấp\r\n280 ml\r\n1200W\r\n1.2kg\r\n307 x 124 x 158 mm', 'images/5e2c692a-fc6a-4ff7-b94b-3ba506246d87.jpeg', 1, 0),
(16, 'Máy Lọc Không Khí 5 Trong 1 Nagakawa NAG3501M', 'Nagakawa', 'Trắng', 2799000, '10000', 'Vỏ bằng nhựa ABS cao cấp\r\n6.2 Kg\r\n220-240/50HZ\r\n62 W\r\n30m2\r\n33 x 20 x 55 cm', 'images/cd94abee-e52c-4344-9170-948aaaf5ade3.jpeg', 1, 0),
(17, 'Quạt Sạc Comet CRF0705', 'Comet', 'Trắng', 226000, '0', '500g\r\nNhựa ABS\r\n5V DC\r\n5W\r\n<45dB\r\n153 x 113 x 200 mm\r\n12.7cm', 'images/666d55da-2929-4d40-99a5-b660bf66f30d.jpeg', 1, 0),
(18, 'Combo 3 lõi lọc nước Karofi 1,2,3', 'Karofi', 'Trắng', 139000, '0', 'Lõi 1 PP Sediment 5 micron\r\nLõi 2 OCB – GAC\r\nLõi 3 PP Sediment 1 Micron', 'images/d8daa720-c90c-42d4-893e-5f74b80a8e2b.jpeg', 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
