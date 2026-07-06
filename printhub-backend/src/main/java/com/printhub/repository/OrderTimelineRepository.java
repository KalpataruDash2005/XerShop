package com.printhub.repository;

import com.printhub.entity.Order;
import com.printhub.entity.OrderTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderTimelineRepository extends JpaRepository<OrderTimeline, Long> {

    List<OrderTimeline> findByOrderOrderByCreatedAtAsc(Order order);

    List<OrderTimeline> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}
