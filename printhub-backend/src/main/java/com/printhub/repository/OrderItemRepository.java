package com.printhub.repository;

import com.printhub.entity.Order;
import com.printhub.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT SUM(oi.pageCount * oi.copies) FROM OrderItem oi WHERE oi.order.id = :orderId")
    Integer sumTotalPagesByOrder(@Param("orderId") Long orderId);

    void deleteByOrderId(Long orderId);
}
